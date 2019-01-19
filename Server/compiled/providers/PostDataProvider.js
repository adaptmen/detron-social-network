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
var PostDataProvider = (function (_super) {
    __extends(PostDataProvider, _super);
    function PostDataProvider() {
        return _super.call(this) || this;
    }
    PostDataProvider.prototype.addPost = function (post) {
        var sparql = this.sparqlHelper.prefixes + "\n            INSERT DATA {\n                GRAPH <" + this.sparqlHelper.graphs_uri.posts + "> {\n                    posts:post_" + post.id + " type:id \"" + post.id + "\" ;\n                    posts:wall walls:wall_" + post.wall_id + " ;\n                    type:time \"" + post.time + "\" ;\n\t\t\t\t\ttype:role \"post\" ;\n                    type:mongo_id \"" + post.mongo_id + "\" ;\n                    type:owner " + post.owner + " .\n                }\n            }";
        return this.query(sparql, 'update');
    };
    PostDataProvider.prototype.getMongoId = function (post_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?mongo_id\n            FROM <" + this.sparqlHelper.graphs_uri.posts + "> {\n                posts:post_" + post_id + " type:mongo_id ?mongo_id .\n            }";
        return this.query(sparql, 'query');
    };
    PostDataProvider.prototype.getPostInfo = function (post_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?id ?wall_id ?time ?mongo_id ?owner_id ?owner_name\n            FROM <" + this.sparqlHelper.graphs_uri.posts + "> {\n                posts:post_" + post_id + " type:id ?id ;\n                type:mongo_id ?mongo_id ;\n                posts:wall ?wall ;\n                posts:owner ?owner .\n                OPTIONAL {\n                    GRAPH <" + this.sparqlHelper.graphs_uri.walls + "> {\n                        ?wall type:id ?wall_id\n                    }\n                }\n                OPTIONAL {\n                    GRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n                        ?owner type:id ?owner_id ;\n                        users:name ?owner_name\n                    }\n                }\n                OPTIONAL {\n                    GRAPH <" + this.sparqlHelper.graphs_uri.groups + "> {\n                        ?owner type:id ?owner_id ;\n                        groups:name ?owner_name\n                    }\n                }\n            }";
        return this.query(sparql, 'query');
    };
    PostDataProvider.prototype.getPostsForWall = function (wall_id, offsetLevel) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?id ?time ?mongo_id ?owner_role ?owner_id ?owner_name (COUNT(?watcher) as ?watch_count)\n            FROM <" + this.sparqlHelper.graphs_uri.posts + ">\n\t\t\tWHERE {\n                ?post posts:wall walls:wall_" + wall_id + " ;\n                type:time ?time ;\n                type:mongo_id ?mongo_id ;\n                type:owner ?owner .\n\t\t\t\t?watcher type:watch ?post\n\t\t\t\tOPTIONAL {\n\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n\t\t\t\t\t\t?owner type:id ?owner_id ;\n                        users:name ?owner_name;\n                        type:role ?owner_role\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tOPTIONAL {\n                    GRAPH <" + this.sparqlHelper.graphs_uri.groups + "> {\n                        ?owner type:id ?owner_id ;\n                        groups:name ?owner_name;\n                        type:role ?owner_role\n                    }\n                }\n            } LIMIT 30 OFFSET " + offsetLevel * 30;
        return this.query(sparql, 'query');
    };
    PostDataProvider.prototype.watchPost = function (user_id, post_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            INSERT DATA {\n                GRAPH <" + this.sparqlHelper.graphs_uri.posts + "> {\n                    users:user_" + user_id + " type:watch posts:post_" + post_id + "\n                }\n            }";
        return this.query(sparql, 'update');
    };
    return PostDataProvider;
}(DataProvider_1.default));
exports.default = PostDataProvider;
