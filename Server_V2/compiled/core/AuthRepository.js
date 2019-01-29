"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var AppTypes_1 = require("./AppTypes");
var AuthRepository = (function () {
    function AuthRepository(dbContext) {
        this.token_store = {};
        this.dbContext = dbContext;
        this.securityHelper = new SecurityHelper_1.default();
    }
    AuthRepository.prototype.login = function (login, password) {
        var _this = this;
        return this.dbContext.login(login, password).then(function (res) {
            if (res === AppTypes_1.default.DENIED)
                return AppTypes_1.default.DENIED;
            if (res === AppTypes_1.default.ACCESS) {
                return _this.generateToken(login);
            }
        });
    };
    AuthRepository.prototype.generateToken = function (login) {
        var new_t = this.securityHelper.generateAuthToken();
        this.token_store[new_t] = { login: login, expire: Date.now() + 1000 * 60 * 60 * 24 * 2 };
        return new_t;
    };
    AuthRepository.prototype.destroyToken = function (token) {
        delete this.token_store[token];
    };
    AuthRepository.prototype.checkToken = function (token) {
        if (!this.token_store[token])
            return AppTypes_1.default.NOT_EXIST;
        if (this.token_store[token].expire < Date.now())
            return AppTypes_1.default.TIME_BANNED;
        return AppTypes_1.default.SUCCESS;
    };
    AuthRepository.prototype.getByToken = function (token) {
        return this.token_store[token];
    };
    AuthRepository.prototype.updateToken = function (token) {
        var last_info = this.token_store[token];
        var new_t = this.securityHelper.generateAuthToken();
        this.token_store[new_t] = last_info;
        delete this.token_store[token];
        return new_t;
    };
    AuthRepository.prototype.signup = function (login, password) {
        var _this = this;
        return this
            .dbContext
            .checkExist(login)
            .then(function (res) {
            if (res === AppTypes_1.default.EXIST)
                return AppTypes_1.default.EXIST;
            if (res === AppTypes_1.default.NOT_EXIST) {
                return _this
                    .dbContext
                    .createUser(login, password)
                    .then(function (r) { return _this.generateToken(login); });
            }
        });
    };
    return AuthRepository;
}());
exports.default = AuthRepository;
