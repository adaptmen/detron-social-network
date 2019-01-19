"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WatchCache = (function () {
    function WatchCache() {
        this.store = {};
    }
    WatchCache.prototype.addWatch = function (user_id, object, time) {
        if (!this.store[user_id]) {
            this.store[user_id] = {};
        }
        this.store[user_id][object] = time;
    };
    WatchCache.prototype.checkWatch = function (user_id, object) {
        return this.store[user_id][object] ? true : false;
    };
    return WatchCache;
}());
exports.default = WatchCache;
