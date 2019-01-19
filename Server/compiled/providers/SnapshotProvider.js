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
var HistoryDataProvider_1 = require("./HistoryDataProvider");
var SnapshotProvider = (function (_super) {
    __extends(SnapshotProvider, _super);
    function SnapshotProvider() {
        var _this = _super.call(this) || this;
        _this.historyProvider = new HistoryDataProvider_1.default();
        return _this;
    }
    SnapshotProvider.prototype.getUsers = function () {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?id ?name ?token ?phone ?wall_id\n        {\n\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n\t\t\t\t?user users:name ?name; \n\t\t\t\ttype:id ?id ;\n\t\t\t\ttype:token ?token ;\n\t\t\t\tusers:phone ?phone .\n\t\t\t}\n\t\t\tOPTIONAL {\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.walls + "> {\n\t\t\t\t\t?wall walls:attacher ?user; type:id ?wall_id;\n\t\t\t\t}\n\t\t\t}\n        }";
        return this.query(sparql, 'query');
    };
    SnapshotProvider.prototype.getHistory = function () {
        return this.historyProvider.getAllHistory();
    };
    return SnapshotProvider;
}(DataProvider_1.default));
exports.default = SnapshotProvider;
