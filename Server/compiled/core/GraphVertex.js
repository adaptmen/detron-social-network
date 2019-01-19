"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GraphVertex = (function () {
    function GraphVertex(graph_string) {
        var matches = graph_string.match(/(\w+):(\w+)_([^.]*)/);
        this.prefix = matches[1];
        this.type = matches[2];
        this.id = matches[3];
    }
    return GraphVertex;
}());
exports.default = GraphVertex;
