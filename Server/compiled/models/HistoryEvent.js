"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var HistoryEvent = (function () {
    function HistoryEvent(subject, object, type, time) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.subject = subject;
        this.object = object;
        this.type = type;
        this.time = time;
    }
    return HistoryEvent;
}());
exports.default = HistoryEvent;
