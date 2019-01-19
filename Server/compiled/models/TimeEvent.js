"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeEvent = (function () {
    function TimeEvent(_count, _last, _ban) {
        this.ban = _ban;
        this.last = _last;
        this.count = _count;
    }
    return TimeEvent;
}());
exports.default = TimeEvent;
