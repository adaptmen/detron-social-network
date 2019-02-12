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
var GroupDataProvider = (function (_super) {
    __extends(GroupDataProvider, _super);
    function GroupDataProvider() {
        return _super.call(this) || this;
    }
    GroupDataProvider.prototype.addGroup = function (group) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tINSERT DATA { \n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.groups + "> \n\t\t\t\t{ \n\t\t\t\t\tgroups:group_" + group.id + " type:id \"" + group.id + "\";\n\t\t\t\t  \ttype:owner users:user_" + group.owner_id + " ;\n\t\t\t\t\ttype:role \"group\" ;\n\t\t\t\t  \tgroups:name \"" + group.name + "\" ;\n\t\t\t\t\ttype:wall walls:wall_" + group.wall_id + " } }";
        return this.query(sparql, 'update');
    };
    GroupDataProvider.prototype.getWall = function (group_id) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?wall_id  \n\t\t\tFROM <" + this.sparqlHelper.graphs_uri.walls + "> \n\t\t\t{ ?wall walls:attacher groups:group_" + group_id + ";\n\t\t\t\t\ttype:id ?wall_id } }";
        return this.query(sparql, 'query');
    };
    return GroupDataProvider;
}(DataProvider_1.default));
exports.default = GroupDataProvider;
