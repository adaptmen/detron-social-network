"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var Wall = (function () {
    function Wall(attacher) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.attacher = attacher;
    }
    return Wall;
}());
exports.default = Wall;
