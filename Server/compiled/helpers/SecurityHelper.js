"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uniqid = require('uniqid');
var SecurityHelper = (function () {
    function SecurityHelper() {
    }
    SecurityHelper.prototype.generateId = function () {
        return uniqid.process() + "-" + uniqid.time() + "-" + uniqid.process() + "-" + uniqid.time() + "-" + uniqid.process();
    };
    SecurityHelper.prototype.generateFileId = function () {
        return uniqid.process(uniqid.time()) + "-" + uniqid.time(uniqid.time()) + "-" + uniqid.process(uniqid.time());
    };
    SecurityHelper.prototype.generateLongId = function () {
        return "" + uniqid.process() + uniqid.time() + uniqid.process() + uniqid.time() + uniqid.process() + uniqid.process() + uniqid.time() + uniqid.process() + uniqid.time() + uniqid.process() + uniqid.process() + uniqid.time() + uniqid.process() + uniqid.time() + uniqid.process() + uniqid.process() + uniqid.time() + uniqid.process() + uniqid.time() + uniqid.process();
    };
    SecurityHelper.prototype.generateToken = function () {
        return "" + uniqid(uniqid(uniqid(uniqid(uniqid(uniqid())))));
    };
    SecurityHelper.prototype.generateSmsCode = function () {
        return Math.floor(Math.random() * 100000).toString();
    };
    return SecurityHelper;
}());
exports.default = SecurityHelper;
