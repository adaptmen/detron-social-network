"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SparqlHelper_1 = require("../helpers/SparqlHelper");
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var request = require('request');
var fs = require('fs');
var DataProvider = (function () {
    function DataProvider() {
        this.base_url = 'http://localhost:3030';
        this.dataset = 'dev';
        this.sparqlHelper = new SparqlHelper_1.default();
        this.securityHelper = new SecurityHelper_1.default();
    }
    DataProvider.prototype.query = function (sparql, type) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            switch (type) {
                case 'query':
                    request.get({
                        url: "http://127.0.0.1:3030/" + _this.dataset + "/" + type + "?query=" + encodeURIComponent(sparql) + "&output=json"
                    }, function (error, full_res, body) {
                        if (error)
                            reject(error);
                        else
                            resolve(_this.sparqlHelper.normalizeData(JSON.parse(body)));
                    });
                    break;
                case 'update':
                    request.post({
                        url: _this.base_url + "/" + _this.dataset + "/" + type,
                        form: {
                            update: sparql
                        }
                    }, function (error, full_res, body) {
                        error ? reject(error) : resolve(body);
                    });
                    break;
            }
        });
    };
    DataProvider.prototype.getByProperty = function (info) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?" + info.edge.property + "\n        FROM <" + info.graph + ">\n        { " + info.vertex.prefix + ":" + info.vertex.fid + " " + info.edge.prefix + ":" + info.edge.property + " ?" + info.edge.property + " }";
        return this.query(sparql, 'query');
    };
    DataProvider.prototype.pushProperties = function (info) {
        var formattedProps = [];
        info.props.forEach(function (prop) {
            for (var key in prop) {
                if (prop[key] !== prop['prefix'])
                    formattedProps.push(prop.prefix + ":" + key + " \"" + prop[key] + "\"");
            }
        });
        var sparql = this.sparqlHelper.prefixes + " \n        INSERT DATA { \n          GRAPH <" + info.graph + ">\n          { " + info.vertex.prefix + ":" + info.vertex.fid + " " + formattedProps.join('; ') + " }\n        }";
        return this.query(sparql, 'update');
    };
    DataProvider.prototype.replaceProperty = function (info) {
        var sparql = this.sparqlHelper.prefixes + "\n        WITH <" + info.graph + ">\n        DELETE {\n          " + info.vertex.prefix + ":" + info.vertex.fid + " " + info.edge.prefix + ":" + info.edge.property + " ?before\n        }\n        INSERT { \n          GRAPH <" + info.graph + "> {\n            " + info.vertex.prefix + ":" + info.vertex.fid + " " + info.edge.prefix + ":" + info.edge.property + " \"" + info.value + "\" \n          }\n        }\n        WHERE {\n          " + info.vertex.prefix + ":" + info.vertex.fid + " " + info.edge.prefix + ":" + info.edge.property + " ?before\n        }";
        return this.query(sparql, 'update');
    };
    DataProvider.prototype.deleteProperty = function (info) {
        var sparql = this.sparqlHelper.prefixes + "\n        WITH <" + info.graph + ">\n        DELETE { " + info.vertex.prefix + ":" + info.vertex.fid + " " + info.edge.prefix + ":" + info.edge.property + " " + info.value + " }\n        WHERE  { " + info.vertex.prefix + ":" + info.vertex.fid + " " + info.edge.prefix + ":" + info.edge.property + " " + info.value + " }";
        return this.query(sparql, 'update');
    };
    return DataProvider;
}());
exports.default = DataProvider;
