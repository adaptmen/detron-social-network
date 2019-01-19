"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SnapshotProvider_1 = require("../providers/SnapshotProvider");
var TimeCache_1 = require("./TimeCache");
var HistoryCache_1 = require("./HistoryCache");
var UsersCache_1 = require("./UsersCache");
var NotifyCache_1 = require("./NotifyCache");
var ChatsCache_1 = require("./ChatsCache");
var WatchCache_1 = require("./WatchCache");
var AppRepository = (function () {
    function AppRepository() {
        this.snapshotProvider = new SnapshotProvider_1.default();
        this.chatsCache = new ChatsCache_1.default();
        this.timeCache = new TimeCache_1.default();
        this.watchCache = new WatchCache_1.default();
        this.usersCache = new UsersCache_1.default();
        this.notifyCache = new NotifyCache_1.default();
        this.historyCache = new HistoryCache_1.default();
        this.messages = {};
        this.authList = {};
        this.subscriptions = {};
        this.chats = {};
        this.usersReady = false;
        this.chatsReady = false;
        this.historyReady = false;
        this.messagesReady = false;
        this.checkTimeBanned = this.timeCache.checkBanned;
        this.getUser = this.usersCache.getUser;
    }
    AppRepository.prototype.start = function () {
        if (this.usersReady
            && this.messagesReady
            && this.historyReady
            && this.chatsReady) {
            this.onInit();
        }
    };
    AppRepository.prototype.attachSocket = function (userId, socketId) {
        this.usersCache.setUserInfo(userId, '_id', socketId);
        this.usersCache.setUserInfo(userId, 'status', UserStatus.ONLINE);
    };
    AppRepository.prototype.detachSocket = function (userId) {
        this.usersCache.setUserInfo(userId, '_id', null);
        this.usersCache.setUserInfo(userId, 'status', UserStatus.OFFLINE);
    };
    AppRepository.prototype.getSocketId = function (user_id) {
        if (this.usersCache.getUser(user_id)['_id']) {
            return this.usersCache.getUser(user_id)['_id'];
        }
        else {
            return false;
        }
    };
    AppRepository.prototype.getChats = function (userId) {
        var results = [];
        for (var sub in this.subscriptions[userId]) {
            if (this.subscriptions[userId][sub] == 'chat') {
                results.push(this.getChatInfo(sub, userId));
            }
        }
        return results;
    };
    AppRepository.prototype.getChatInfo = function (chatId, userId) {
        var isPrivate = this.chats[chatId].privacy == 'private';
        var chatName = '';
        if (isPrivate) {
            for (var key in this.chats[chatId].subscribers) {
                if (key != userId && this.chats[chatId].subscribers[key] == true) {
                    chatName = this.usersCache[key].name;
                    break;
                }
            }
        }
    };
    AppRepository.prototype.createUser = function (user) {
        this.usersCache.addUser(user);
        this.authList[user.phone] = {
            token: user.token,
            id: user.id
        };
    };
    AppRepository.prototype.subscribeUser = function (userId, objectId, objectType) {
        if (this.subscriptions[userId]) {
            this.subscriptions[userId][objectId] = objectType;
        }
        else {
            this.subscriptions[userId] = {};
            this.subscriptions[userId][objectId] = objectType;
        }
    };
    AppRepository.prototype.checkUser = function (phone, token) {
        return this.authList[phone]['token'] == token;
    };
    AppRepository.prototype.checkInAuth = function (phone) {
        return this.authList[phone];
    };
    AppRepository.prototype.addMessage = function (msg) {
        if (!this.messages[msg.chat_id]) {
            this.messages[msg.chat_id] = {};
            this.messages[msg.chat_id][msg.id] = {
                time: msg.time,
                content: msg.content,
                maker_id: msg.maker_id
            };
        }
        else {
            this.messages[msg.chat_id][msg.id] = {
                time: msg.time,
                content: msg.content,
                maker_id: msg.maker_id
            };
        }
    };
    AppRepository.prototype.takeSnapshot = function () {
        var _this = this;
        this
            .snapshotProvider
            .getUsers()
            .then(function (users) {
            users.forEach(function (user) {
                _this.createUser(user);
            });
            _this.usersReady = true;
            _this.start();
        });
        this
            .snapshotProvider
            .getHistory()
            .then(function (history) {
            history.forEach(function (event) {
                _this.historyCache.addEvent(event);
            });
            _this.historyReady = true;
            _this.start();
        });
    };
    return AppRepository;
}());
exports.default = AppRepository;
