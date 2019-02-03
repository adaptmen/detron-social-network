"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SocketTypes;
(function (SocketTypes) {
    SocketTypes["APP_INIT"] = "app_init";
    SocketTypes["SOCKET_REQUEST"] = "socket_request";
    SocketTypes["ACCESS"] = "access";
    SocketTypes["DENIED"] = "denied";
    SocketTypes["GET_CHATS"] = "get_chats";
    SocketTypes["GET_UPLOAD_TOKEN"] = "get_upload_token";
})(SocketTypes || (SocketTypes = {}));
exports.default = SocketTypes;
