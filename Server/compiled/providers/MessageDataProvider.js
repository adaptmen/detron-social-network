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
    function MessageDataProvider() {
        return _super.call(this) || this;
    }
    MessageDataProvider.prototype.addMessage = function (message) {
        var sparql = this.sparqlHelper.prefixes + "\n            INSERT DATA\n            {\n              GRAPH <" + this.sparqlHelper.graphs_uri.messages + ">\n              {\n                messages:msg_" + message.id + " type:id \"" + message.id + "\" ;\n                messages:maker users:user_" + message.maker_id + " ;\n                type:time \"" + message.time + "\" ;\n                messages:chat chats:chat_" + message.chat_id + ";\n                messages:mongo_id \"" + message.mongo_id + "\"\n              }}";
        return this.query(sparql, 'update');
    };
    MessageDataProvider.prototype.getMessageById = function (msg_id, chat_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?id ?time ?maker_id ?maker_name ?chat_id ?mongo_id\n        FROM <" + this.sparqlHelper.graphs_uri.messages + ">\n        {\n\t\t\tmessages:msg_" + msg_id + " type:id ?id ;\n\t\t\ttype:id ?id ;\n\t\t\tmessages:chat ?chat ;\n\t\t\tmessages:mongo_id ?mongo_id ;\n\t\t\tmessages:maker ?maker .\n\t\t\tOPTIONAL {\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n\t\t\t\t\t?maker type:id ?maker_id;\n\t\t\t\t\tusers:name ?maker_name;\n\t\t\t\t}\n\t\t\t}\n\t\t\tOPTIONAL {\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.chats + "> {\n\t\t\t\t\t?chat type:id ?chat_id .\n\t\t\t\t}\n\t\t\t}\n        }";
        console.log(sparql);
        return this.query(sparql, 'query');
    };
    MessageDataProvider.prototype.getMessagesByUser = function (user_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?chat_id ?text ?maker_id ?time\n        FROM <" + this.sparqlHelper.graphs_uri.messages + ">\n        WHERE { {\n          ?user users:id \"" + user_id + "\" .\n          ?user users:subscribe ?chat .\n          ?chat chats:id ?chat . }\n          UNION {\n            GRAPH ?chat {\n              ?chat chats:id ?chat_id .\n              ?msg messages:text ?msg_id .\n              ?msg messages:time ?time .\n              ?msg messages:maker ?maker .\n              ?maker users:id ?maker_id }}}";
        return this.query(sparql, 'query');
    };
    MessageDataProvider.prototype.getMessagesByChat = function (chat_id, offsetLevel) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?id ?time ?maker_id ?maker_name ?mongo_id \n\t\t\t{\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.messages + "> {\n\t\t\t\t\t?message messages:chat chats:chat_" + chat_id + " ;\n\t\t\t\t\tmessages:id ?id ;\n\t\t\t\t\tmessages:time ?time ;\n\t\t\t\t\tmessages:text ?content ;\n\t\t\t\t\tmessages:maker ?maker .\n\t\t\t\t}\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.messages + "> {\n\t\t\t\t\t?maker type:id ?maker_id ;\n\t\t\t\t\tusers:name ?maker_name .\n\t\t\t\t}\n\t\t\t}\n\t\t\tORDER BY ?time\n\t\t\tLIMIT 30\n\t\t\tOFFSET " + offsetLevel * 30;
        return this.query(sparql, 'query');
    };
    MessageDataProvider.prototype.updateMessage = function (chat_id, msg_id, text) {
        var sparql = this.sparqlHelper.prefixes + "\n        WITH <" + this.sparqlHelper.graphs_uri.messages + ">\n        DELETE { messages:msg_" + msg_id + " messages:text ?value }\n        WHERE  { messages:msg_" + msg_id + " messages:text ?value };\n        INSERT DATA { \n          GRAPH <" + this.sparqlHelper.graphs_uri.messages + ">\n          { messages:msg_" + msg_id + " messages:text \"" + text + "\" }\n        }";
        return this.query(sparql, 'update');
    };
    MessageDataProvider.prototype.deleteMessage = function (chart_id, msg_id) {
        var sparql = this.sparqlHelper.prefixes + "\n        DROP <" + this.sparqlHelper.graphs_uri.messages + "#msg_" + msg_id + ">";
        return this.query(sparql, 'update');
    };
    return MessageDataProvider;
}(DataProvider_1.default));
exports.default = MessageDataProvider;
