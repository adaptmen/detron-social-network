"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var AppTypes_1 = require("./AppTypes");
var SocketTypes_1 = require("./SocketTypes");
var cookie = require("cookie");
var SocketContext = (function () {
    function SocketContext(io, dbContext, authRepository) {
        var _this = this;
        this.securityHelper = new SecurityHelper_1.default();
        this.user = {};
        this.send = {
            self: function (socket, answer) {
                socket.emit(answer.code, answer.answer);
            },
            toRoom: function (socket, roomName, eventName, msg) {
                socket.broadcast.to(roomName).emit(eventName, msg);
            },
            toRoomAndSelf: function (roomName, eventName, msg) {
                _this.io.sockets.in(roomName).emit(eventName, msg);
            },
            all: function (socket, eventName, msg) {
                socket.broadcast.emit(eventName, msg);
            },
            allAndSelf: function (eventName, msg) {
                _this.io.emit(eventName, msg);
            },
            toSocket: function (socket, socketId, answer) {
                socket.broadcast.to(socketId).emit(answer.code, answer.answer);
            }
        };
        this.dbContext = dbContext;
        this.authRepository = authRepository;
        this.io = io;
        console.log('socket io started');
        this.io.use(function (_socket, next) {
            var cookies = cookie.parse(_socket.handshake.headers['cookie']);
            var authToken = cookies['t'];
            var tokenStatus = _this.authRepository.checkToken(authToken);
            if (tokenStatus === AppTypes_1.default.SUCCESS) {
                next();
            }
            else {
                next(new Error('not auth'));
            }
        });
        this.io.sockets.on('connection', function (socket) {
            var token = cookie.parse(socket.handshake.headers['cookie'])['t'];
            _this
                .dbContext
                .getUserInit(_this.authRepository.getByToken(token).login)
                .then(function (data) {
                console.log(data);
                socket.user = data.user;
                console.log('Connected user:', socket.user.id);
                setTimeout(function () {
                    socket.emit(SocketTypes_1.default.APP_INIT, data);
                    console.log(socket.user.id, SocketTypes_1.default.APP_INIT);
                }, 1000);
                socket.on('disconnect', function () {
                    console.log('Disconnect user: ', socket.user.id);
                });
            });
            var sendAnswer = function (id, type, msg) {
                socket.emit(type + "_" + id, msg);
            };
            socket.on(SocketTypes_1.default.SOCKET_REQUEST, function (body) {
                var r_id = body['id'];
                var r_type = body['type'];
                var r_msg = body['msg'];
                if (r_type == SocketTypes_1.default.GET_UPLOAD_TOKEN) {
                    _this
                        .dbContext
                        .checkUploadAccess(socket.user.id, r_msg.object_fid)
                        .then(function (res) {
                        if (res === AppTypes_1.default.SUCCESS) {
                            sendAnswer(r_id, SocketTypes_1.default.GET_UPLOAD_TOKEN, _this.dbContext
                                .generateUploadToken(socket.user.id, r_msg.object_fid));
                        }
                        else {
                            sendAnswer(r_id, SocketTypes_1.default.GET_UPLOAD_TOKEN, SocketTypes_1.default.DENIED);
                        }
                    });
                }
                else if (r_type == SocketTypes_1.default.GET_PAGE) {
                    _this
                        .dbContext
                        .getPage(r_msg.id)
                        .then(function (ans) {
                        if (ans == AppTypes_1.default.NOT_EXIST) {
                            sendAnswer(r_id, SocketTypes_1.default.GET_PAGE, AppTypes_1.default.NOT_EXIST);
                        }
                        else if (ans.id) {
                            sendAnswer(r_id, SocketTypes_1.default.GET_PAGE, ans);
                        }
                    });
                }
                else if (r_type == SocketTypes_1.default.GET_WALL_FILES) {
                    _this
                        .dbContext
                        .getFileList("walls:wall_" + r_msg.id)
                        .then(function (file_list) {
                        file_list.forEach(function (s_file) {
                            s_file['file_url'] = "/disk/wall_" + r_msg.id + "/" + s_file['id'];
                            delete s_file['id'];
                        });
                    });
                }
            });
            socket.on(SocketTypes_1.default.GET_CHATS, function () {
                _this
                    .dbContext
                    .getChats(socket.user.id)
                    .then(function (chats) {
                    socket.emit(SocketTypes_1.default.GET_CHATS, chats);
                });
            });
        });
    }
    SocketContext.prototype.joinTo = function (socket, room_id) {
        socket.join(room_id);
    };
    SocketContext.prototype.getRoom = function (room_id) {
        return this.io.sockets.adapter.rooms[room_id];
    };
    return SocketContext;
}());
exports.default = SocketContext;
var Answer = (function () {
    function Answer() {
    }
    return Answer;
}());
