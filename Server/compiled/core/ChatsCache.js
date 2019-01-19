"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChatsCache = (function () {
    function ChatsCache() {
        this.store = {};
    }
    ChatsCache.prototype.addChat = function (chat) {
        this.store[chat.id] = chat;
    };
    ChatsCache.prototype.addSubscriber = function (chat_id, user_id) {
        this.store[chat_id].subscribers[user_id] = '';
    };
    ChatsCache.prototype.removeSubscriber = function (chat_id, user_id) {
        delete this.store[chat_id].subscribers[user_id];
    };
    ChatsCache.prototype.setChatInfo = function (chat_id, prop, value) {
        this.store[chat_id][prop] = value;
    };
    ChatsCache.prototype.getSubscribers = function (chat_id) {
        return this.store[chat_id].subscribers.keys();
    };
    return ChatsCache;
}());
exports.default = ChatsCache;
