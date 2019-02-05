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
var FileDataProvider = (function (_super) {
    __extends(FileDataProvider, _super);
    function FileDataProvider() {
        var _this = _super.call(this) || this;
        _this.TOKEN_LIVE_TIME = 60 * 1000;
        _this.token_store = {};
        return _this;
    }
    FileDataProvider.prototype.generateToken = function (user_id, object_fid) {
        var token = this.securityHelper.generateToken();
        this.token_store[token] = {
            user_id: user_id,
            object_fid: object_fid,
            expire: Date.now() + 1000 * 60 * 5
        };
        return token;
    };
    FileDataProvider.prototype.getTokenData = function (token) {
        if (!this.token_store[token])
            return AppTypes_1.default.NOT_EXIST;
        if (this.token_store[token].expire < Date.now()) {
            delete this.token_store[token];
            return AppTypes_1.default.TIME_BANNED;
        }
        else
            return this.token_store[token];
    };
    FileDataProvider.prototype.addFile = function (file_id, attacher) {
        var sparql = this.sparqlHelper.prefixes + "\n        INSERT DATA { \n          GRAPH <" + this.sparqlHelper.graphs_uri.files + ">\n            { files:file_" + file_id + " type:id \"" + file_id + "\";\n              files:attacher " + attacher + " ;\n              files:privacy \"public\" } }";
        return this.query(sparql, 'update');
    };
    FileDataProvider.prototype.getFile = function (file_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?mongo_id ?attacher\n        FROM <" + this.sparqlHelper.graphs_uri.files + ">\n        { files:file_" + file_id + " files:mongo_id ?mongo_id .\n        }";
        return this.query(sparql, 'query');
    };
    FileDataProvider.prototype.getByOwner = function (owner) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?file_id ?mongo_id\n        FROM <" + this.sparqlHelper.graphs_uri.files + ">\n        { ?file files:attacher " + owner + "; type:id ?file_id; files:mongo_id ?mongo_id .\n        }";
        return this.query(sparql, 'query');
    };
    return FileDataProvider;
}(DataProvider_1.default));
exports.default = FileDataProvider;
