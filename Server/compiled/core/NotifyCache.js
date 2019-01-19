"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Notify_1 = require("../models/Notify");
var NotifyCache = (function () {
    function NotifyCache() {
        this.store = {};
    }
    NotifyCache.prototype.addNotify = function (user_id, event_id) {
        var new_notify = new Notify_1.default(event_id);
        if (!this.store[user_id])
            this.store[user_id] = {};
        this.store[user_id][new_notify.id] = new_notify;
        return new_notify;
    };
    NotifyCache.prototype.watchNotify = function (user_id, notify_id) {
        this.store[user_id][notify_id].watched = true;
    };
    NotifyCache.prototype.getNotify = function (user_id, notify_id) {
        return this.store[user_id][notify_id];
    };
    NotifyCache.prototype.getUnwatched = function (user_id) {
        return this
            .store[user_id]
            .values()
            .filter(function (notify) {
            return notify.watched === false;
        });
    };
    return NotifyCache;
}());
exports.default = NotifyCache;
