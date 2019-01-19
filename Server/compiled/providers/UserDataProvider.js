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
var UserDataProvider = (function (_super) {
    __extends(UserDataProvider, _super);
    function UserDataProvider() {
        return _super.call(this) || this;
    }
    UserDataProvider.prototype.insertUser = function (user_id, phone, token, ftoken) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tINSERT DATA\n\t\t\t{\n\t\t\t  GRAPH <" + this.sparqlHelper.graphs_uri.users + ">\n\t\t\t  {\n\t\t\t\tusers:user_" + user_id + " type:id \"" + user_id + "\" ;\n\t\t\t\tusers:phone \"" + phone + "\" ;\n\t\t\t\tusers:name \"" + phone + "\" ;\n\t\t\t\ttype:token \"" + token + "\" ;\n\t\t\t\ttype:role \"user\" ;\n\t\t\t\ttype:file_token \"" + ftoken + "\" ;\n\t\t\t\ttype:created_at \"" + Date.now() + "\" .\n\t\t\t  }}";
        return this.query(sparql, 'update');
    };
    UserDataProvider.prototype.getUserById = function (userId) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?id ?name\n\t\t\tFROM <" + this.sparqlHelper.graphs_uri.users + "> \n\t\t\t{ ?user type:id \"" + userId + "\" .\n\t\t\t  ?user users:name ?name; \n\t\t\t\t\ttype:id ?id .\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getAllUsers = function () {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?id ?name\n\t\t\tFROM <" + this.sparqlHelper.graphs_uri.users + "> \n\t\t\t{ ?user users:name ?name; \n\t\t\t\t\ttype:id ?id .\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getChats = function (user_id) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?chat_id\n\t\t\t{\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + ">  {\n\t\t\t\t\tusers:user_" + user_id + " type:subscribe ?chat .\n\t\t\t\t}\n\t\t\t\tOPTIONAL {\n\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.chats + ">  {\n\t\t\t\t\t\t?chat type:role \"chat\" ;\n\t\t\t\t\t\ttype:id ?chat_id .\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.mateWithUser = function (user_id, mate_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            INSERT DATA\n            {\n              GRAPH <" + this.sparqlHelper.graphs_uri.users + ">\n              {\n                users:user_" + user_id + " users:mate users:user_" + mate_id + " \n              }}";
        return this.query(sparql, 'update');
    };
    UserDataProvider.prototype.getFriends = function (user_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?friend_id\n            FROM <" + this.sparqlHelper.graphs_uri.users + "> \n            {\n              users:user_" + user_id + " users:mate ?friend .\n              ?friend users:mate users:user_" + user_id + " .          \n            }";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getMates = function (user_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?mate_id\n            FROM <" + this.sparqlHelper.graphs_uri.users + "> \n            {\n              users:user_" + user_id + " users:mate ?mate .\n              ?mate type:id ?mate_id .\n            } FILTER NOT EXISTS {\n                ?partner users:mate users:user_" + user_id + "\n            }";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getPartners = function (user_id) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?partner_id\n            FROM <" + this.sparqlHelper.graphs_uri.users + "> \n            {\n              ?partner users:mate users:user_" + user_id + " .\n              ?partner type:id ?partner_id .          \n            } FILTER NOT EXISTS {\n                users:user_" + user_id + " users:mate ?mate\n            }";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getNews = function (user_id, offsetLevel) {
        var sparql = this.sparqlHelper.prefixes + "\n            SELECT ?id ?time ?mongo_id ?wall_id ?wall_owner_name ?wall_owner_id ?owner_id ?owner_name (COUNT(?watcher) as ?watch_count)\n            {\n\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n\t\t\t\t\tusers:user_" + user_id + " type:subscribe ?wall .\n\t\t\t\t}\n\t\t\t\tOPTIONAL {\n\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.walls + "> {\n\t\t\t\t\t\t?wall type:role \"wall\" ;\n\t\t\t\t\t\ttype:id ?wall_id ;\n\t\t\t\t\t\twalls:attacher ?wall_owner .\n\t\t\t\t\t\tOPTIONAL {\n\t\t\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n\t\t\t\t\t\t\t\t?wall_owner type:id ?wall_owner_id ;\n\t\t\t\t\t\t\t\tusers:name ?wall_owner_name .\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\tOPTIONAL {\n\t\t\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.groups + "> {\n\t\t\t\t\t\t\t\t?wall_owner type:id ?wall_owner_id ;\n\t\t\t\t\t\t\t\tgroups:name ?wall_owner_name .\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tOPTIONAL {\n\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.posts + "> {\n\t\t\t\t\t\t?post posts:wall ?wall ;\n\t\t\t\t\t\ttype:id ?id ;\n\t\t\t\t\t\ttype:time ?time ;\n\t\t\t\t\t\ttype:owner ?owner ;\n\t\t\t\t\t\ttype:mongo_id ?mongo_id .\n\t\t\t\t\t\tOPTIONAL {\n\t\t\t\t\t\t\tGRAPH <" + this.sparqlHelper.graphs_uri.users + "> {\n\t\t\t\t\t\t\t\t?owner type:id ?owner_id ;\n\t\t\t\t\t\t\t\tusers:name ?owner_name .\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n            } ORDER BY DESC(?time) LIMIT 30 OFFSET " + offsetLevel * 30;
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getPrivateInfoById = function (id) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?property ?value\n\t\t\tFROM <" + this.sparqlHelper.graphs_uri.users + "> \n\t\t\t{\n\t\t\t  users:" + ('user_' + id) + " ?property ?value .            \n\t\t\t}";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getPrivateInfo = function (phone, token) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?id ?phone ?token ?name\n\t\t\tFROM <" + this.sparqlHelper.graphs_uri.users + "> \n\t\t\tWHERE\n\t\t\t{\n\t\t\t  ?user type:token \"" + token + "\" ;\n\t\t\t\tusers:phone \"" + phone + "\" ;\n\t\t\t\ttype:id ?id ;\n\t\t\t\ttype:token ?token ;\n\t\t\t\tusers:phone ?phone ;\n\t\t\t\tOPTIONAL {\n\t\t\t\t  ?user users:name ?name \n\t\t\t\t}\n\t\t\t}";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getProperty = function (user_id, property) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tSELECT ?" + property + "\n\t\t\tFROM <" + this.sparqlHelper.graphs_uri.users + "> \n\t\t\t{ users:" + ('user_' + user_id) + " users:" + property + " ?" + property + " }";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.subscribeUser = function (user_id, object) {
        var sparql = this.sparqlHelper.prefixes + "\n            INSERT DATA\n            {\n              GRAPH <" + this.sparqlHelper.graphs_uri.users + ">\n              {\n                users:user_" + user_id + " type:subscribe " + object + " \n              }}";
        return this.query(sparql, 'update');
    };
    UserDataProvider.prototype.describeUser = function (user_id, object_fid) {
        return this.deleteProperty({
            graph: "" + this.sparqlHelper.graphs_uri.users,
            value: object_fid,
            vertex: {
                prefix: 'users',
                fid: "user_" + user_id
            },
            edge: {
                prefix: 'type',
                property: 'subscribe'
            }
        });
    };
    UserDataProvider.prototype.addValueToProperty = function (user_id, property, value) {
        var sparql = this.sparqlHelper.prefixes + "\n\t\t\tWITH <" + this.sparqlHelper.graphs_uri.users + ">\n\t\t\tDELETE { users:user_" + user_id + " users:" + property + " ?before }\n\t\t\tINSERT { GRAPH <" + this.sparqlHelper.graphs_uri.users + "#> \n\t\t\t{ users:user_" + user_id + " users:" + property + " ?after } }\n\t\t\tWHERE {\n\t\t\t  users:user_" + user_id + " users:" + property + " ?before .\n\t\t\t  BIND( (?before + " + value + ") AS ?after ) }";
        return this.query(sparql, 'update');
    };
    UserDataProvider.prototype.addInfo = function (userId, userData) {
        console.log('User data in provider: ');
        console.log(userData);
        var props = [];
        for (var key in userData) {
            var obj = {};
            obj[key] = userData[key];
            obj['prefix'] = key === 'id' || key === 'token' ? 'type' : 'users';
            props.push(obj);
        }
        return this.pushProperties({
            graph: "" + this.sparqlHelper.graphs_uri.users,
            vertex: {
                prefix: 'users',
                fid: "user_" + userId
            },
            props: props
        });
    };
    UserDataProvider.prototype.replaceInfo = function (userId, edgeName, value) {
        return this.replaceProperty({
            graph: "" + this.sparqlHelper.graphs_uri.users,
            value: value,
            vertex: {
                prefix: 'users',
                fid: "user_" + userId
            },
            edge: {
                prefix: edgeName == 'id' || edgeName == 'token' || edgeName == 'subscribe' ? 'type' : 'users',
                property: edgeName
            }
        });
    };
    UserDataProvider.prototype.deletePropertiesByKey = function (id, property) {
        var sparql = this.sparqlHelper.prefixes + "\n        WITH <" + this.base_url + "/" + this.dataset + ">\n        DELETE { users:user_" + id + " users:" + property + " ?value }\n        WHERE  { users:user_" + id + " users:" + property + " ?value }";
        return this.query(sparql, 'update');
    };
    UserDataProvider.prototype.checkExist = function (phone, token) {
        var sparql = this.sparqlHelper.prefixes + "\n        ASK {\n         GRAPH <" + this.base_url + "/" + this.dataset + ">\n        { ?user users:phone \"" + phone + "\"; type:token \"" + token + "\" } }";
        return this.query(sparql, 'query');
    };
    UserDataProvider.prototype.getUserByPhone = function (phone) {
        var sparql = this.sparqlHelper.prefixes + "\n        SELECT ?phone ?token\n        FROM <" + this.base_url + "/" + this.dataset + ">\n        WHERE\n        {\n          ?user users:phone \"" + phone + "\" ;\n            type:token ?token ;\n            users:phone ?phone .\n        } LIMIT 1";
        return this.query(sparql, 'query');
    };
    return UserDataProvider;
}(DataProvider_1.default));
exports.default = UserDataProvider;
