"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var Message = (function () {
    function Message(chat_id, maker_id, time) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.time = time;
        this.chat_id = chat_id;
        this.maker_id = maker_id;
    }
    return Message;
}());
exports.default = Message;
