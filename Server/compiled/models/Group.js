"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var Group = (function () {
    function Group(owner_id, name) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.owner_id = owner_id;
        this.name = name;
    }
    return Group;
}());
exports.default = Group;
