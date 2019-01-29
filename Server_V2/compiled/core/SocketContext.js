"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var AppTypes_1 = require("./AppTypes");
var SocketTypes_1 = require("./SocketTypes");
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
        this.io = io;
        console.log('socket io started');
        this.io.use(function (_socket, next) {
            var authToken = _socket.handshake.query.t;
            var tokenStatus = _this.authRepository.checkToken(authToken);
            if (tokenStatus === AppTypes_1.default.SUCCESS) {
                next();
            }
            else {
                next(new Error('not auth'));
            }
        });
        this.io.sockets.on('connection', function (socket) {
            console.log("Connect", socket.id);
            var token = socket.handshake.query.t;
            _this
                .dbContext
                .getUser(_this.authRepository.getByToken(token).login)
                .then(function (user) {
                socket.user = {
                    id: user.id
                };
                console.log('Connected user: ', socket.user.id);
                socket.emit(SocketTypes_1.default.USER_INIT, user);
                socket.on('disconnect', function () {
                    console.log('Disconnect user: ', socket.user.id);
                });
            });
            socket.on(SocketTypes_1.default.GET_UPLOAD_TOKEN, function (info) {
                _this
                    .dbContext
                    .checkUploadAccess(socket.user.id, info.object_fid)
                    .then(function (res) {
                    if (res === AppTypes_1.default.SUCCESS) {
                        socket.emit(SocketTypes_1.default.GET_UPLOAD_TOKEN, _this.dbContext
                            .generateUploadToken(socket.user.id, info.object_fid));
                    }
                    else {
                        socket.emit(SocketTypes_1.default.GET_UPLOAD_TOKEN, 'error');
                    }
                });
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
