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
var ChatDataProvider = (function (_super) {
    __extends(ChatDataProvider, _super);
    function ChatDataProvider() {
        return _super.call(this) || this;
    }
    ChatDataProvider.prototype.addChat = function (chat_id) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tINSERT DATA { \n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.chats + "> \n\t\t\t\t{ chats:chat_" + chat_id + " type:id \"" + chat_id + "\" ;\n\t\t\t\t\tchats:privacy \"private\" ;\n\t\t\t\t\ttype:role \"chat\" . } }";
        return this.query(sparql, 'update');
    };
    ChatDataProvider.prototype.checkChat = function (user_id, companion_id) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tASK WHERE\n\t\t\t{\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.chats + ">\n\t\t\t\t{ \n\t\t\t\t\tusers:user_" + user_id + " type:subscribe ?chat .\n\t\t\t\t\tusers:user_" + companion_id + " type:subscribe ?chat .\n\t\t\t\t}\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    ChatDataProvider.prototype.getChatId = function (user_id, companion_id) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?chat_id\n\t\t\tWHERE\n\t\t\t{\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.chats + ">\n\t\t\t\t{ \n\t\t\t\t\tusers:user_" + user_id + " type:subscribe ?chat .\n\t\t\t\t\tusers:user_" + companion_id + " type:subscribe ?chat .\n\t\t\t\t}\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.chats + "> {\n\t\t\t\t\t?chat type:id ?chat_id .\n\t\t\t\t}\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    ChatDataProvider.prototype.getCounts = function (chat_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?user ?count\n        FROM <" + this.sparqlHelper.graphs_uri.chats + ">\n        { ?user users:count ?count }";
        return this.query(sparql, 'query');
    };
    ChatDataProvider.prototype.incrementCounts = function (chat_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        WITH <" + this.sparqlHelper.graphs_uri.chats + ">\n        DELETE { ?user users:count ?precount }\n        INSERT { GRAPH <" + this.base_url + "/" + this.dataset + "> { ?user users:count ?updated } }\n        WHERE {\n            ?user users:count ?precount .\n            BIND( (?precount + 1) AS ?updated ) }";
        return this.query(sparql, 'update');
    };
    ChatDataProvider.prototype.getProperty = function (chat_id, property) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?" + property + "\n        FROM <" + this.sparqlHelper.graphs_uri.chats + ">\n        { chats:chat_" + chat_id + " chats:" + property + " ?" + property + " }";
        return this.query(sparql, 'query');
    };
    ChatDataProvider.prototype.pushProperty = function (chat_id, property, value) {
        var sparql = this.sparqlHelper.prefixes + " \n        INSERT DATA { \n          GRAPH <" + this.sparqlHelper.graphs_uri.chats + ">\n          { chats:chat_" + chat_id + " " + property + " \"" + value + "\" }\n        }";
        return this.query(sparql, 'update');
    };
    ChatDataProvider.prototype.addValueToProperty = function (chat_id, property, value) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tWITH <" + this.sparqlHelper.graphs_uri.chats + ">\n\t\t\tDELETE { chats:chat_" + chat_id + " chats:" + property + " ?before }\n\t\t\tINSERT { GRAPH <" + this.base_url + "/" + this.dataset + "> { chats:chat_" + chat_id + " chats:" + property + " ?after } }\n\t\t\tWHERE {\n\t\t\t  chats:chat_" + chat_id + " chats:" + property + " ?before .\n\t\t\t  BIND( (?before + " + value + ") AS ?after ) }";
        return this.query(sparql, 'update');
    };
    ChatDataProvider.prototype.checkPersonalChat = function (userId, companionId) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t  SELECT ?id\n\t\t  FROM <" + this.sparqlHelper.graphs_uri.chats + ">\n\t\t  { \n\t\t\t?user type:id \"" + userId + "\" .\n\t\t\t?user type:subscribe ?chat .\n\t\t\t?companion type:id \"" + companionId + "\" .\n\t\t\t?companion type:subscribe ?chat .\n\t\t\t?chat chats:personal \"private\" ;\n\t\t\t\t  type:id ?id .\n\t\t  } ";
        return this.query(sparql, 'query');
    };
    return ChatDataProvider;
}(DataProvider_1.default));
exports.default = ChatDataProvider;
