"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AppTypes_1 = require("./AppTypes");
var Validator = (function () {
    function Validator() {
    }
    Validator.prototype.validate = function (str, params) {
        var result;
        if (params.min) {
            this.minLength(str, params.min) == AppTypes_1.default.SUCCESS
                ? result = AppTypes_1.default.SUCCESS
                : result = AppTypes_1.default.ERROR_MIN_LENGTH;
        }
        if (params.max) {
            this.maxLength(str, params.max) == AppTypes_1.default.SUCCESS
                ? result = AppTypes_1.default.SUCCESS
                : result = AppTypes_1.default.ERROR_MAX_LENGTH;
        }
        if (params.match) {
            this.match(str, params.match) == AppTypes_1.default.SUCCESS
                ? result = AppTypes_1.default.SUCCESS
                : result = AppTypes_1.default.ERROR_MATCH;
        }
        return result;
    };
    Validator.prototype.minLength = function (str, len) {
        if (str.length >= len) {
            return AppTypes_1.default.SUCCESS;
        }
        else {
            return AppTypes_1.default.ERROR;
        }
    };
    Validator.prototype.maxLength = function (str, len) {
        if (str.length <= len) {
            return AppTypes_1.default.SUCCESS;
        }
        else {
            return AppTypes_1.default.ERROR;
        }
    };
    Validator.prototype.match = function (str, regex) {
        if (str.match(regex)) {
            return AppTypes_1.default.SUCCESS;
        }
        else {
            return AppTypes_1.default.ERROR;
        }
    };
    return Validator;
}());
exports.default = Validator;
