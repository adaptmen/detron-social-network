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
    function HistoryDataProvider(sqlContext) {
        var _this = _super.call(this) || this;
        _this.sqlContext = sqlContext;
        return _this;
    }
    HistoryDataProvider.prototype.addEvent = function (type, subject, object, time) {
        var _this = this;
        var event_id = this.securityHelper.generateId();
        return new Promise(function (resolve, reject) {
            _this.sqlContext.query("USE history\n             INSERT INTO `" + _this.sqlContext.current_history_table + "` (id, type, subject, object, time)\n              VALUES ('" + event_id + "', '" + type + "', '" + subject + "', '" + object + "', '" + time + "')")
                .then(function () {
                var sparql = _this.sparqlHelper.prefixes + " \n                        INSERT DATA {\n                            GRAPH <" + _this.sparqlHelper.graphs_uri.history + ">\n                            { events:event_" + event_id + " type:id \"" + event_id + "\";\n                                events:subject " + subject + " ;\n                                events:object " + object + " ;\n                                events:type \"" + type + "\" ;\n                                type:role \"event\" ;\n                                type:time \"" + time + "\" } }";
                _this.query(sparql, 'update').then(function () { resolve(); });
            });
        });
    };
    HistoryDataProvider.prototype.getAllHistory = function () {
        var sparql = this.sparqlHelper.prefixes + " \n                    SELECT ?event_id ?subject_id ?object_id ?event_type ?time ?content\n                    FROM <" + this.sparqlHelper.graphs_uri.history + "> \n                    {   \n                        ?event type:id ?event_id ;\n                        events:type ?event_type ;\n                        type:time ?time ;\n                        events:content ?content .\n                        ?event events:subject ?subject .\n                        ?event events:object ?object .\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.users + "}> \n                            {\n                                ?subject type:id ?subject_id .\n                                ?object type:id ?object_id .\n                            }\n                        }\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.chats + "}> \n                            {\n                                ?object type:id ?object_id .\n                            }\n                        }\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.walls + "}>\n                            {\n                                ?object type:id ?object_id .\n                            }\n                        }\n                        OPTIONAL {\n                            GRAPH <" + this.sparqlHelper.graphs_uri.posts + "}>\n                            {\n                                ?object type:id ?object_id .\n                            }\n                        }}";
        return this.query(sparql, 'query');
    };
    return HistoryDataProvider;
}(DataProvider_1.default));
exports.default = HistoryDataProvider;
