"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SparqlHelper = (function () {
    function SparqlHelper() {
        this.prefixes = 'PREFIX users: <http://localhost:3030/users#> \n' +
            'PREFIX chats: <http://localhost:3030/chats#> \n' +
            'PREFIX messages: <http://localhost:3030/messages#> \n' +
            'PREFIX walls: <http://localhost:3030/walls#> \n' +
            'PREFIX type: <http://localhost:3030/type#> \n' +
            'PREFIX files: <http://localhost:3030/files#> \n' +
            'PREFIX events: <http://localhost:3030/events#> \n' +
            'PREFIX news: <http://localhost:3030/news#> \n' +
            'PREFIX posts: <http://localhost:3030/posts#> \n';
        this.graphs_uri = {
            users: 'http://localhost:3030/users',
            messages: 'http://localhost:3030/messages',
            chats: 'http://localhost:3030/chats',
            walls: 'http://localhost:3030/walls',
            posts: 'http://localhost:3030/posts',
            files: 'http://localhost:3030/files',
            watches: 'http://localhost:3030/watches',
            history: 'http://localhost:3030/history',
            groups: 'http://localhost:3030/groups'
        };
    }
    SparqlHelper.prototype.normalizeData = function (sparqlData) {
        if (!sparqlData.results) {
            return sparqlData['boolean'];
        }
        else {
            var bindings = sparqlData.results.bindings;
            var result = [];
            for (var i = 0; i < bindings.length; i++) {
                var obj = {};
                for (var key in bindings[i]) {
                    obj[key] = bindings[i][key]['value'];
                }
                result.push(obj);
            }
            return result;
        }
    };
    return SparqlHelper;
}());
exports.default = SparqlHelper;
