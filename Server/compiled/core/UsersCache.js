"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UsersCache = (function () {
    function UsersCache() {
        this.store = {};
    }
    UsersCache.prototype.addUser = function (user) {
        user['offsetLevelPosts'] = 0;
        user['offsetLevelMessage'] = 0;
        user['offsetLevelNews'] = 0;
        this.store[user.id] = user;
    };
    UsersCache.prototype.getUser = function (user_id) {
        return this.store[user_id];
    };
    UsersCache.prototype.setUserInfo = function (user_id, prop, value) {
        this.store[user_id][prop] = value;
    };
    return UsersCache;
}());
exports.default = UsersCache;
