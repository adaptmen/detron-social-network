"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uniqid = require('uniqid');
var crypto = require('crypto');
var SecurityHelper = (function () {
    function SecurityHelper() {
    }
    SecurityHelper.prototype.get_r = function (length) {
        return crypto.randomBytes(length / 2).toString('hex');
    };
    SecurityHelper.prototype.generateId = function () {
        return this.get_r(14) + "-" + this.get_r(10);
    };
    SecurityHelper.prototype.generateFileId = function () {
        return this.get_r(14) + "-" + this.get_r(10) + "-" + this.get_r(20);
    };
    SecurityHelper.prototype.generateLongId = function () {
        return this.get_r(14) + "-" + this.get_r(10) + "-" + this.get_r(20) + "-" + this.get_r(14) + "-" + this.get_r(10) + "-" + this.get_r(20);
    };
    SecurityHelper.prototype.generateToken = function () {
        return "" + this.get_r(100);
    };
    SecurityHelper.prototype.generateAuthToken = function () {
        return this.get_r(14) + "-" + this.get_r(10);
    };
    SecurityHelper.prototype.generateSmsCode = function () {
        return Math.floor(Math.random() * 100000).toString();
    };
    return SecurityHelper;
}());
exports.default = SecurityHelper;
