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
var WallDataProvider = (function (_super) {
    __extends(WallDataProvider, _super);
    function WallDataProvider() {
        return _super.call(this) || this;
    }
    WallDataProvider.prototype.addWall = function (wall) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tINSERT DATA { \n\t\t\t  GRAPH <" + this.sparqlHelper.graphs_uri.walls + "> \n\t\t\t\t{ walls:wall_" + wall.id + " type:id \"" + wall.id + "\";\n\t\t\t\t\ttype:role \"wall\" ;\n\t\t\t\t\twalls:attacher " + wall.attacher + " } }";
        return this.query(sparql, 'update');
    };
    WallDataProvider.prototype.getOwnerInfo = function (wall_id) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?id ?name\n\t\t\t{\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.walls + "> {\n\t\t\t\t\twalls:wall_" + wall_id + " walls:owner ?owner .\n\t\t\t\t}\n\t\t\t\tOPTIONAL {\n\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n\t\t\t\t\t\t?owner type:id ?id ;\n\t\t\t\t\t\tusers:name ?name\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tOPTIONAL {\n\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.groups + "> {\n\t\t\t\t\t\t?owner type:id ?id ;\n\t\t\t\t\t\tgroups:name ?name\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    WallDataProvider.prototype.checkOwner = function (wall_id, user_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            ASK WHERE\n            {\n                GRAPH <" + this.sparqlHelper.graphs_uri.walls + ">\n                { \n                    walls:wall_" + wall_id + " walls:attacher users:\n                }\n            }}";
        return this.query(sparql, 'query');
    };
    WallDataProvider.prototype.getWallInfoByOwner = function (owner) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?wall_id\n        FROM <" + this.sparqlHelper.graphs_uri.walls + ">\n        { ?wall walls:owner " + owner + "; type:id ?wall_id }";
        return this.query(sparql, 'query');
    };
    WallDataProvider.prototype.getSubscribers = function (wall_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?subscriber_id\n        FROM <" + this.sparqlHelper.graphs_uri.walls + "/wall_" + wall_id + "> \n        { ?wall walls:id \"" + wall_id + "\" .\n          OPTIONAL { GRAPH <" + this.base_url + "/" + this.dataset + "> \n          { ?subscriber users:subscribe ?wall; users:id ?subscriber_id } } }";
        return this.query(sparql, 'query');
    };
    WallDataProvider.prototype.getSubscribersCount = function (wall_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT (COUNT(?subscriber) AS ?count)\n        FROM <" + this.sparqlHelper.graphs_uri.walls + "/wall_" + wall_id + "> \n        { ?wall walls:id \"" + wall_id + "\" .\n          OPTIONAL { GRAPH <" + this.base_url + "/" + this.dataset + "> \n          { ?subscriber posts:wall ?wall } } }";
        return this.query(sparql, 'query');
    };
    WallDataProvider.prototype.getWall = function (wall_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?owner_id ?owner_name ?post_id ?post_time ?post_text\n        FROM <" + this.sparqlHelper.graphs_uri.walls + "/wall_" + wall_id + "> \n        { ?wall walls:id \"" + wall_id + "\";\n          walls:owner ?owner .\n          ?owner type:id ?owner_id .\n          ?owner type:name ?owner_name .\n          OPTIONAL { GRAPH <" + this.sparqlHelper.graphs_uri.posts + "> \n          { ?post posts:wall ?wall;\n            posts:id ?post_id;\n            posts:time ?post_id } } }";
        return this.query(sparql, 'query');
    };
    return WallDataProvider;
}(DataProvider_1.default));
exports.default = WallDataProvider;
