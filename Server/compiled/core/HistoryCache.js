"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HistoryCache = (function () {
    function HistoryCache() {
        this.store = {};
    }
    HistoryCache.prototype.addEvent = function (event) {
        this.store[event.id] = event;
    };
    HistoryCache.prototype.getEvent = function (event_id) {
        return this.store[event_id];
    };
    return HistoryCache;
}());
exports.default = HistoryCache;
