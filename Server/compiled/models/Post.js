"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var Post = (function () {
    function Post(wall_id, owner, content) {
        this.securityHelper = new SecurityHelper_1.default();
        this.id = this.securityHelper.generateId();
        this.time = String(Date.now());
        this.wall_id = wall_id;
        this.owner = owner;
        this.content = content;
    }
    return Post;
}());
exports.default = Post;
