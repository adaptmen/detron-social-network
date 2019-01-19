"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var Chat = (function () {
    function Chat(owner_id, companion_id) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.subscribers.push(owner_id);
        this.subscribers.push(companion_id);
        this.privacy = 'private';
    }
    return Chat;
}());
exports.default = Chat;
