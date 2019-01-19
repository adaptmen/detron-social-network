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
var HistoryDataProvider = (function (_super) {
    __extends(HistoryDataProvider, _super);
    function HistoryDataProvider() {
        return _super.call(this) || this;
    }
    HistoryDataProvider.prototype.addEvent = function (event) {
        var event_id = this.securityHelper.generateId();
        var sparql = this.sparqlHelper.prefixes + " \n                    INSERT DATA {\n                        GRAPH <" + this.sparqlHelper.graphs_uri.history + ">\n                        { events:event_" + event.id + " type:id \"" + event.id + "\";\n                            events:subject " + event.subject + " ;\n                            events:object " + event.object + " ;\n                            events:type \"" + event.type + "\" ;\n                            type:role \"event\" ;\n                            type:time \"" + event.time + "\" } }";
        return this.query(sparql, 'update');
    };
    HistoryDataProvider.prototype.getAllHistory = function () {
        var sparql = this.sparqlHelper.prefixes + " \n                    SELECT ?event_id ?subject_id ?object_id ?event_type ?time ?content\n                    FROM <" + this.sparqlHelper.graphs_uri.history + "> \n                    {   \n                        ?event type:id ?event_id ;\n                        events:type ?event_type ;\n                        type:time ?time ;\n                        events:content ?content .\n                        ?event events:subject ?subject .\n                        ?event events:object ?object .\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.users + "}> \n                            {\n                                ?subject type:id ?subject_id .\n                                ?object type:id ?object_id .\n                            }\n                        }\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.chats + "}> \n                            {\n                                ?object type:id ?object_id .\n                            }\n                        }\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.walls + "}>\n                            {\n                                ?object type:id ?object_id .\n                            }\n                        }\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.posts + "}>\n                            {\n                                ?object type:id ?object_id .\n                            }\n                        }}";
        return this.query(sparql, 'query');
    };
    return HistoryDataProvider;
}(DataProvider_1.default));
exports.default = HistoryDataProvider;
