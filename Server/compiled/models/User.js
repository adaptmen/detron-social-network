"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var User = (function () {
    function User(phone) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.token = this.securityHelper.generateToken();
        this.f_token = this.securityHelper.generateToken();
        this.name = phone;
        this.phone = phone;
    }
    return User;
}());
exports.default = User;
