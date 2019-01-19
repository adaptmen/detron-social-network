"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeEvent_1 = require("../models/TimeEvent");
var TimeEvents_1 = require("./TimeEvents");
var TimeCache = (function () {
    function TimeCache() {
        this.TIME_ACTION_INTERVAL = 500;
        this.TIME_COUNT_LIMIT = 5;
        this.TIME_BAN = 2 * 60 * 1000;
        this.time_store = new TimeStore();
    }
    TimeCache.prototype.addPoint = function (user_id) {
        this.time_store[user_id].addStatistic(user_id);
        if (!this.time_store.checkBanned(user_id)) {
            if (this.time_store.getStatistic(user_id).count >= this.TIME_COUNT_LIMIT) {
                this.time_store.getStatistic(user_id).ban = Date.now() + this.TIME_BAN;
                return TimeEvents_1.default.BUNNED;
            }
            if (Date.now() <= this.time_store[user_id].last + this.TIME_ACTION_INTERVAL) {
                this.time_store.getStatistic(user_id).count++;
                return TimeEvents_1.default.ALLOW;
            }
            else {
                this.time_store[user_id].count = 1;
                return TimeEvents_1.default.ALLOW;
            }
        }
        else {
            return TimeEvents_1.default.BUNNED;
        }
    };
    TimeCache.prototype.checkBanned = function (user_id) {
        return this.time_store.checkBanned(user_id);
    };
    TimeCache.prototype.getBunTime = function (user_id) {
        return this.time_store[user_id];
    };
    return TimeCache;
}());
exports.default = TimeCache;
var TimeStore = (function () {
    function TimeStore() {
        this.store = {};
    }
    TimeStore.prototype.addStatistic = function (user_id) {
        if (!this.store[user_id]) {
            this.store[user_id] = new TimeEvent_1.default(1, Date.now(), Date.now() - 1);
        }
    };
    TimeStore.prototype.getStatistic = function (user_id) {
        return this.store[user_id];
    };
    TimeStore.prototype.checkBanned = function (user_id) {
        return this.store[user_id].ban >= Date.now();
    };
    TimeStore.prototype.getBunTime = function (user_id) {
        return this.store[user_id].ban - Date.now();
    };
    return TimeStore;
}());
