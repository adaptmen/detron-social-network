"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var DataProvider_1 = require("./DataProvider");
var AppTypes_1 = require("../core/AppTypes");
var UserDataProvider = (function (_super) {
    __extends(UserDataProvider, _super);
    function UserDataProvider(sqlContext) {
        var _this = _super.call(this) || this;
        _this.sqlContext = sqlContext;
        return _this;
    }
    UserDataProvider.prototype.insertUser = function (user_id, login, password, token, ftoken) {
        var _this = this;
        return this
            .sqlContext
            .db('app')
            .query("INSERT INTO ?? \n            (id, name, login, password, token, f_token)\n             VALUES (?, ?, ?, ?, ?, ?)", ['users', user_id, login, login, password, token, ftoken])
            .then(function (res) {
            var sparql = _this.sparqlHelper.prefixes + "\n                INSERT DATA\n                {\n                    GRAPH <" + _this.sparqlHelper.graphs_uri.users + ">\n                    {\n                        users:user_" + user_id + " type:id \"" + user_id + "\" ;\n                        users:login \"" + login + "\";\n                        type:role \"user\" ;\n                        type:created_at \"" + Date.now() + "\" .\n                }}";
            return _this.query(sparql, 'update');
        });
    };
    UserDataProvider.prototype.getUserById = function (userId) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?id ?login\n\t\t\tFROM <" + this.sparqlHelper.graphs_uri.users + "> \n\t\t\t{ ?user type:id \"" + userId + "\" .\n\t\t\t  ?user users:login ?login; \n\t\t\t\t\ttype:id ?id .\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getPersonById = function (user_id) {
        return this
            .sqlContext
            .db('app').query("SELECT ??, ??, ?? FROM ?? WHERE id = ?", ['id', 'name', 'avatar_url', 'users', user_id]);
    };
    UserDataProvider.prototype.getPersonsById = function (users_ids) {
        var str = users_ids.join('", "');
        return this
            .sqlContext
            .db('app').query("SELECT ??, ??, ??\n         FROM ?? WHERE id IN (?)", ['id', 'name', 'avatar_url', str]);
    };
    UserDataProvider.prototype.getByLogin = function (login) {
        return this
            .sqlContext
            .db('app').query("SELECT ??, ??, ??, ??\n         FROM ?? WHERE login = ?", ['app', 'id', 'name', 'login', 'password', 'users', login]);
    };
    UserDataProvider.prototype.getUserInit = function (login) {
        var fields = ['id', 'name', 'login', 'password', 'avatar_url', 'age', "city", "wall_id"];
        return this
            .sqlContext
            .db('app').query("SELECT ??\n         FROM ?? WHERE login = ?", [fields, 'users', login]);
    };
    UserDataProvider.prototype.getPageUserById = function (id) {
        var fields = ['id', 'name', 'login', 'avatar_url', 'age', "city", "wall_id"];
        return this
            .sqlContext
            .db('app').query("SELECT ??\n         FROM ?? WHERE id = ?", [fields, 'users', id]);
    };
    UserDataProvider.prototype.checkAccess = function (login, password) {
        var columns = ['login', 'password'];
        var sql = "SELECT * FROM ?? WHERE login = ? AND password = ?";
        return this.sqlContext.db('app').query(sql, ['users', login, password]);
    };
    UserDataProvider.prototype.checkExist = function (login) {
        var sql = "SELECT ?? FROM ?? WHERE login = ?";
        return this.sqlContext.db('app').query(sql, ['login', 'users', login]);
    };
    UserDataProvider.prototype.checkExistById = function (id) {
        var sql = "SELECT ?? FROM ?? WHERE id = ?";
        return this.sqlContext.db('app').query(sql, ['id', 'users', id]);
    };
    UserDataProvider.prototype.checkSubscribe = function (user_id, object) {
        var sparql = this.sparqlHelper.prefixes + "\n            ASK WHERE\n            {\n                GRAPH <" + this.sparqlHelper.graphs_uri.users + ">\n                { \n                    users:user_" + user_id + " type:subscribe ?object\n                }\n            }";
        return this.query(sparql, 'query').then(function (res) { return res ? AppTypes_1.default.SUCCESS : AppTypes_1.default.ERROR; });
    };
    UserDataProvider.prototype.subscribeUser = function (user_id, object) {
        var sparql = this.sparqlHelper.prefixes + "\n            INSERT DATA\n            {\n              GRAPH <" + this.sparqlHelper.graphs_uri.users + ">\n              {\n                users:user_" + user_id + " type:subscribe " + object + " \n              }}";
        return this.query(sparql, 'update');
    };
    return UserDataProvider;
}(DataProvider_1.default));
exports.default = UserDataProvider;
