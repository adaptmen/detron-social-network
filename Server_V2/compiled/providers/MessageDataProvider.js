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
var MessageDataProvider = (function (_super) {
    __extends(MessageDataProvider, _super);
    function MessageDataProvider(sqlContext) {
        var _this = _super.call(this) || this;
        _this.sqlContext = sqlContext;
        return _this;
    }
    MessageDataProvider.prototype.addMessage = function (chat_id, maker_id, content, time) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var msg_id = _this.securityHelper.generateId();
            _this
                .sqlContext
                .query("USE chats INSERT INTO `chat_" + chat_id + "`\n             (id, maker_id, content, time)\n              VALUES ('" + msg_id + "', '" + maker_id + "', '" + content + "', '" + time + "')")
                .then(function () {
                var sparql = _this.sparqlHelper.prefixes + "\n                INSERT DATA\n                {\n                  GRAPH <" + _this.sparqlHelper.graphs_uri.messages + ">\n                  {\n                    messages:msg_" + msg_id + " type:id \"" + msg_id + "\" ;\n                    messages:maker users:user_" + maker_id + " ;\n                    type:time \"" + time + "\" ;\n                    messages:chat chats:chat_" + chat_id + "\n                  }}";
                _this.query(sparql, 'update').then(function () { resolve(); });
            });
        });
    };
    MessageDataProvider.prototype.getChats = function (user_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?chat_id ?friend_id\n            {\n                GRAPH <" + this.sparqlHelper.graphs_uri.users + ">  {\n                    users:user_" + user_id + " type:subscribe ?chat .\n                    ?friend type:subscribe ?chat;\n                    type:id ?friend_id.\n                }\n                OPTIONAL {\n                    GRAPH <" + this.sparqlHelper.graphs_uri.chats + ">  {\n                        ?chat type:role \"chat\" ;\n                        type:id ?chat_id .\n                    }\n                }\n            }";
        return this.query(sparql, 'query');
    };
    MessageDataProvider.prototype.createChat = function (chat_id, user_1_id, user_2_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .sqlContext
                .query("USE chats CREATE TABLE `chat_" + chat_id + "`")
                .then(function (res) {
                _this
                    .sqlContext
                    .query("USE containers INSERT INTO `user_" + user_1_id + "`\n                    (type, object_id, last_message)\n                    VALUES ('chat', '" + chat_id + "', NULL)")
                    .then(function (res) {
                    _this
                        .sqlContext
                        .query("USE containers INSERT INTO `user_" + user_2_id + "`\n                        (type, object_id, last_data)\n                        VALUES ('chat', '" + chat_id + "', NULL)")
                        .then(function (res) {
                        var sparql = _this.sparqlHelper.prefixes + "\n                        INSERT DATA { \n                            GRAPH <" + _this.sparqlHelper.graphs_uri.chats + "> \n                            { chats:chat_" + chat_id + " type:id \"" + chat_id + "\" ;\n                                chats:privacy \"private\" ;\n                                type:role \"chat\" . } }";
                        _this.query(sparql, 'update')
                            .then(function () {
                            resolve();
                        });
                    });
                });
            });
        });
    };
    MessageDataProvider.prototype.getMessagesByChat = function (chat_id, offsetLevel) {
        return this
            .sqlContext
            .query("USE `chats` SELECT id, maker_id, content, time\n         FROM `chat_" + chat_id + "` LIMIT 30 OFFSET " + 30 * offsetLevel);
    };
    MessageDataProvider.prototype.updateMessage = function (chat_id, msg_id, text) {
        var sparql = this.sparqlHelper.prefixes + "\n            WITH <" + this.sparqlHelper.graphs_uri.messages + ">\n            DELETE { messages:msg_" + msg_id + " messages:text ?value }\n            WHERE  { messages:msg_" + msg_id + " messages:text ?value };\n            INSERT DATA { \n              GRAPH <" + this.sparqlHelper.graphs_uri.messages + ">\n              { messages:msg_" + msg_id + " messages:text \"" + text + "\" }\n            }";
        return this.query(sparql, 'update');
    };
    MessageDataProvider.prototype.deleteMessage = function (chart_id, msg_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        DROP <" + this.sparqlHelper.graphs_uri.messages + "#msg_" + msg_id + ">";
        return this.query(sparql, 'update');
    };
    return MessageDataProvider;
}(DataProvider_1.default));
exports.default = MessageDataProvider;
