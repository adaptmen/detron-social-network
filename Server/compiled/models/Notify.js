"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var Notify = (function () {
    function Notify(event_id) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.event_id = event_id;
        this.watched = false;
    }
    return Notify;
}());
exports.default = Notify;
