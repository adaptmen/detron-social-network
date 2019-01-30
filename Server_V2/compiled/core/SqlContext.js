"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var AppTypes_1 = require("./AppTypes");
var config = require('../config.json');
var SqlContext = (function () {
    function SqlContext() {
        var _this = this;
        this.current_history_table = '201901';
        this._db = '';
        this.query = function (sql, placeholders) {
            return new Promise(function (resolve, reject) {
                var connection = mysql.createConnection({
                    host: config['sql_db']['host'],
                    port: config['sql_db']['port'],
                    user: config['sql_db']['user'],
                    password: config['sql_db']['password'],
                    database: 'app'
                });
                connection.changeUser({
                    database: _this._db
                });
                connection.connect(function (err) {
                    var q = connection.query(mysql.format(sql, placeholders) || [], function (err, results, fields) {
                        connection.destroy();
                        if (err)
                            return reject(err);
                        if (results.length == 0)
                            return resolve(AppTypes_1.default.EMPTY);
                        if (results.length == 1)
                            return resolve(results[0]);
                        return resolve(results);
                    });
                    console.log(q.sql);
                });
            });
        };
    }
    SqlContext.prototype.db = function (_db) {
        this._db = _db;
        return { query: this.query };
    };
    return SqlContext;
}());
exports.default = SqlContext;
