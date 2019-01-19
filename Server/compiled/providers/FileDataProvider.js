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
var FileDataProvider = (function (_super) {
    __extends(FileDataProvider, _super);
    function FileDataProvider() {
        var _this = _super.call(this) || this;
        _this.TOKEN_LIVE_TIME = 60 * 1000;
        _this.access_tokens = {};
        return _this;
    }
    FileDataProvider.prototype.addToken = function (token, uf_token, user_id, privacy) {
        console.log('Add ', token);
        this.access_tokens[token] = {
            time: Date.now() + this.TOKEN_LIVE_TIME,
            uf_token: uf_token,
            user_id: user_id,
            privacy: privacy
        };
        console.log("Tokens: ", this.access_tokens);
    };
    FileDataProvider.prototype.checkToken = function (token) {
        console.log("Token in check: ", token);
        console.log("All tokens: ", this.access_tokens);
        if (this.access_tokens[token]) {
            console.log(this.access_tokens[token].time >= Date.now());
            if (this.access_tokens[token].time >= Date.now()) {
                var tokenInfo = Object.assign({}, this.access_tokens[token]);
                delete this.access_tokens[token];
                console.log(tokenInfo);
                return tokenInfo;
            }
            else {
                delete this.access_tokens[token];
                return false;
            }
        }
        else {
            return false;
        }
    };
    FileDataProvider.prototype.addFile = function (file_id, owner_id, privacy, mongo_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        INSERT DATA { \n          GRAPH <" + this.base_url + "/" + this.dataset + ">\n            { files:file_" + file_id + " type:id \"" + file_id + "\";\n              files:owner users:user_" + owner_id + " ;\n              files:privacy \"" + privacy + "\" ;\n              files:mongo_id \"" + mongo_id + "\" } }";
        return this.query(sparql, 'update');
    };
    FileDataProvider.prototype.getFile = function (file_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?mongo_id ?privacy ?owner_id\n        FROM <" + this.base_url + "/" + this.dataset + "> \n        { files:file_" + file_id + " files:owner ?owner .\n          ?owner type:id ?owner_id .\n          files:file_" + file_id + " files:privacy ?privacy ;\n          files:mongo_id ?mongo_id .\n        }";
        return this.query(sparql, 'query');
    };
    return FileDataProvider;
}(DataProvider_1.default));
exports.default = FileDataProvider;
