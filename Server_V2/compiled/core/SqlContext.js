"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var AppTypes_1 = require("./AppTypes");
var config = require('../config.json');
var SqlContext = (function () {
    function SqlContext() {
        this.current_history_table = '201901';
        this.query = function (sql) {
            return new Promise(function (resolve, reject) {
                var connection = mysql.createConnection({
                    host: config['sql_db']['host'],
                    port: config['sql_db']['port'],
                    user: config['sql_db']['user'],
                    password: config['sql_db']['password']
                });
                connection.connect(function (err) {
                    connection.query(sql, function (err, results, fields) {
                        connection.destroy();
                        if (err)
                            return reject(err);
                        if (results.length == 0)
                            return resolve(AppTypes_1.default.EMPTY);
                        if (results.length == 1)
                            return resolve(results[0]);
                        return resolve(results);
                    });
                });
            });
        };
    }
    return SqlContext;
}());
exports.default = SqlContext;
