"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var Group_1 = require("../models/Group");
var Wall_1 = require("../models/Wall");
var HistoryEvent_1 = require("../models/HistoryEvent");
var HistoryEventTypes_1 = require("./HistoryEventTypes");
var Message_1 = require("../models/Message");
var RequestTypes_1 = require("./RequestTypes");
var Answer_1 = require("./Answer");
var GraphVertex_1 = require("./GraphVertex");
var SocketContext = (function () {
    function SocketContext(io, appRepository, dbContext, mongoContext) {
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
        this.mongoContext = mongoContext;
        this.io = io;
        console.log('socket io started');
        this.appRepository = appRepository;
        this.io.use(function (_socket, next) {
            var authData = _socket.handshake.query;
            console.log('AuthData: ', authData);
            console.log('Auth user: ', _this.appRepository.authList[authData['phone']]);
            if (_this.appRepository.authList[authData.phone].token == authData.token) {
                next();
            }
            else {
                next(new Error('not auth'));
            }
        });
        this.io.sockets.on('connection', function (socket) {
            console.log("Connect", socket.id);
            var authData = socket.handshake.query;
            var repUser = _this.appRepository.getUser(_this.appRepository.authList[authData.phone].id);
            socket.user = {
                id: repUser.id
            };
            _this.send.self(socket, new Answer_1.default(RequestTypes_1.default.SYNC_NOTIFY, _this.appRepository.notifyCache.getUnwatched(socket.user.id)));
            _this.appRepository.attachSocket(socket.user.id, socket.id);
            console.log('Connected user: ', socket.user.id);
            socket.emit(RequestTypes_1.default.USER_INIT, repUser);
            socket.on('test', function (info) {
                console.log(info);
                socket.emit('test', 456);
            });
            socket.on('disconnect', function () {
                console.log('Disconnect user: ', socket.user.id);
                _this.appRepository.detachSocket(socket.user.id);
            });
            socket.on('getPersonalChatInfo', function (chatId) {
                var chat = _this.appRepository.getChatInfo(chatId, socket.user.id);
                socket.emit('getPersonalChatInfoResult', chat);
            });
            socket.on(RequestTypes_1.default.CREATE_GROUP, function (info) {
                var new_group = new Group_1.default(socket.user.id, info.name);
                var new_wall = new Wall_1.default("groups:group_" + new_group.id);
                _this
                    .dbContext
                    .createGroup(new_group, new_wall)
                    .then(function () {
                    _this.send.self(socket, new Answer_1.default(RequestTypes_1.default.CREATE_GROUP, RequestTypes_1.default.SUCCESS));
                });
            });
            socket.on(RequestTypes_1.default.CREATE_POST, function (post) {
                _this
                    .dbContext
                    .createPost(post)
                    .then(function () {
                    _this.send.self(socket, new Answer_1.default(RequestTypes_1.default.CREATE_POST, RequestTypes_1.default.SUCCESS));
                });
            });
            socket.on(RequestTypes_1.default.GET_WALL, function (info) {
                var offsetLevel = _this
                    .appRepository
                    .usersCache
                    .getUser(socket.user.id)['offsetLevelPosts'];
                _this
                    .dbContext
                    .getWall(info.id, offsetLevel, socket.user.id)
                    .then(function (wall) {
                    _this
                        .appRepository
                        .usersCache
                        .setUserInfo(socket.user.id, 'offsetLevelPosts', offsetLevel + 1);
                    _this.send.self(socket, new Answer_1.default(RequestTypes_1.default.GET_WALL, wall));
                });
            });
            socket.on('getAllUsers', function (info) {
            });
            socket.on('getPageById', function (info) {
                var user = _this.appRepository.getUser(info.id);
                socket.emit('getPageByIdResult', {
                    id: user.id,
                    phone: user.phone,
                    name: user.name
                });
            });
            socket.on(RequestTypes_1.default.OPEN_CHAT, function (info) {
                _this
                    .dbContext
                    .openChat(socket.user.id, info.companion_id).then(function (chat_id) {
                    _this
                        .appRepository
                        .usersCache
                        .setUserInfo(socket.user.id, 'offsetLevelMessage', 0);
                    _this.send.self(socket, new Answer_1.default(RequestTypes_1.default.OPEN_CHAT, chat_id));
                });
            });
            socket.on(RequestTypes_1.default.GET_MESSAGES, function (info) {
                _this
                    .dbContext
                    .getMessages(info.chat_id, socket.user.id)
                    .then(function (messages) {
                    socket.emit(RequestTypes_1.default.GET_MESSAGES, messages);
                });
            });
            socket.on(RequestTypes_1.default.GET_NEWS, function () {
                _this
                    .dbContext
                    .getNews(socket.user.id)
                    .then(function (posts) {
                    _this.send.self(socket, new Answer_1.default(RequestTypes_1.default.GET_NEWS, posts));
                });
            });
            socket.on(RequestTypes_1.default.GET_CHATS, function () {
                socket.emit(RequestTypes_1.default.GET_CHATS, _this.appRepository.getChats(socket.user.id));
            });
            socket.on(RequestTypes_1.default.SEND_MESSAGE, function (client_msg) {
                var new_message = new Message_1.default(client_msg.chat_id, socket.user.id, Date.now());
                _this
                    .dbContext
                    .createMessage(new_message)
                    .then(function () {
                    var chat_event = new HistoryEvent_1.default(new_message.chat_id, new_message.id, HistoryEventTypes_1.default.NEW_MESSAGE, new_message.time);
                    var user_event = new HistoryEvent_1.default(socket.user.id, chat_event.id, HistoryEventTypes_1.default.HISTORY_EVENT, new_message.time);
                    _this.appRepository.historyCache.addEvent(chat_event);
                    _this.appRepository.historyCache.addEvent(user_event);
                    _this
                        .appRepository
                        .chatsCache
                        .getSubscribers(new_message.chat_id)
                        .forEach(function (user_id) {
                        var new_notify = _this.appRepository.notifyCache.addNotify(user_id, chat_event.id);
                        var sid = _this.appRepository.getSocketId(user_id);
                        if (sid) {
                            _this.send.toSocket(socket, sid, new Answer_1.default(RequestTypes_1.default.SYNC_NOTIFY, [new_notify]));
                        }
                    });
                });
            });
            socket.on(RequestTypes_1.default.SYNC_NOTIFY, function (notify) {
                var event = _this
                    .appRepository
                    .historyCache
                    .getEvent(_this
                    .appRepository
                    .notifyCache
                    .getNotify(socket.user.id, notify.id)
                    .event_id);
                switch (event.type) {
                    case HistoryEventTypes_1.default.NEW_MESSAGE:
                        _this
                            .dbContext
                            .getMessage(new GraphVertex_1.default(event.object).id, new GraphVertex_1.default(event.subject).id)
                            .then(function (message) {
                            _this.send.self(socket, new Answer_1.default(RequestTypes_1.default.NEW_MESSAGE, message));
                        });
                        break;
                }
            });
            socket.on(RequestTypes_1.default.UPDATE_USER_DATA, function (update_data) {
                console.log('Данные для обновления: ', update_data);
                _this
                    .dbContext
                    .updateUserData(socket.user.id, update_data)
                    .then(function (result) {
                    if (result === RequestTypes_1.default.SUCCESS) {
                        _this
                            .send.self(socket, new Answer_1.default(RequestTypes_1.default.UPDATE_USER_DATA, RequestTypes_1.default.SUCCESS));
                    }
                    else {
                        _this
                            .send.self(socket, new Answer_1.default(RequestTypes_1.default.UPDATE_USER_DATA, RequestTypes_1.default.ERROR));
                    }
                });
            });
            socket.on('accessFile', function (info) {
                var access_token = _this.securityHelper.generateId();
                socket.emit('accessFile', { code: "access_code", answer: { access_code: access_token } });
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
