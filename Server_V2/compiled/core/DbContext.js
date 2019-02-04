"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var FileDataProvider_1 = require("../providers/FileDataProvider");
var HistoryDataProvider_1 = require("../providers/HistoryDataProvider");
var MessageDataProvider_1 = require("../providers/MessageDataProvider");
var UserDataProvider_1 = require("../providers/UserDataProvider");
var WallDataProvider_1 = require("../providers/WallDataProvider");
var GroupDataProvider_1 = require("../providers/GroupDataProvider");
var AppTypes_1 = require("./AppTypes");
var DbContext = (function () {
    function DbContext(mongoContext, sqlContext) {
        this.securityHelper = new SecurityHelper_1.default();
        this.mongoContext = mongoContext;
        this.sqlContext = sqlContext;
        this.messageProvider = new MessageDataProvider_1.default(this.sqlContext);
        this.historyProvider = new HistoryDataProvider_1.default(this.sqlContext);
        this.userProvider = new UserDataProvider_1.default(this.sqlContext);
        this.wallProvider = new WallDataProvider_1.default(this.sqlContext);
        this.fileProvider = new FileDataProvider_1.default();
        this.groupProvider = new GroupDataProvider_1.default();
    }
    DbContext.prototype.login = function (login, password) {
        return this
            .userProvider
            .checkAccess(login, password)
            .then(function (res) {
            if (res === AppTypes_1.default.EMPTY)
                return AppTypes_1.default.DENIED;
            else
                return AppTypes_1.default.ACCESS;
        });
    };
    DbContext.prototype.checkExist = function (login) {
        return this.userProvider.checkExist(login).then(function (res) {
            if (res === AppTypes_1.default.EMPTY)
                return AppTypes_1.default.NOT_EXIST;
            else
                return AppTypes_1.default.EXIST;
        });
    };
    DbContext.prototype.getUser = function (login) {
        return this.userProvider.getByLogin(login);
    };
    DbContext.prototype.getUserInit = function (login) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .userProvider
                .getUserInit(login)
                .then(function (user) {
                _this
                    .getChats(user.id)
                    .then(function (chats) {
                    resolve({ user: user, chats: chats });
                });
            });
        });
    };
    DbContext.prototype.getChats = function (user_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .messageProvider
                .getChats(user_id)
                .then(function (chats) {
                if (chats.length == 0)
                    return resolve([]);
                var ids = [];
                chats.forEach(function (chat) {
                    ids.push(chat.friend_id);
                });
                _this.sqlContext
                    .query("USE app SELECT id, name, avatar_url\n\t\t\t\t FROM `users` WHERE id IN (\"" + ids.join('\', \'') + "\")")
                    .then(function (friends) {
                    chats.forEach(function (chat) {
                        friends.forEach(function (friend) {
                            if (chat.friend_id == friend.id) {
                                chat['name'] = friend.name;
                                chat['user_id'] = friend.id;
                                chat['avatar_url'] = friend.avatar_url;
                            }
                        });
                    });
                    resolve(chats);
                });
            });
        });
    };
    DbContext.prototype.checkUploadAccess = function (user_id, object_fid) {
        var _this = this;
        var wall_parse = String(object_fid).match(/(wall)_([^.]+)/);
        var chat_parse = String(object_fid).match(/(chat)_([^.]+)/);
        var user_parse = String(object_fid).match(/(user)_([^.]+)/);
        return new Promise(function (resolve, reject) {
            if (!wall_parse && !chat_parse && !user_parse)
                return reject(AppTypes_1.default.ERROR);
            if (wall_parse) {
                _this
                    .wallProvider
                    .getOwnerInfo(wall_parse[2])
                    .then(function (res) {
                    return res.id == user_id
                        ? resolve(AppTypes_1.default.SUCCESS)
                        : resolve(AppTypes_1.default.ERROR);
                });
            }
            if (chat_parse) {
                _this
                    .userProvider
                    .checkSubscribe(user_id, object_fid)
                    .then(function (res) {
                    return res === AppTypes_1.default.SUCCESS
                        ? resolve(AppTypes_1.default.SUCCESS)
                        : resolve(AppTypes_1.default.ERROR);
                });
            }
            if (user_parse) {
                "user_" + user_id == object_fid
                    ? resolve(AppTypes_1.default.SUCCESS)
                    : resolve(AppTypes_1.default.ERROR);
            }
        });
    };
    DbContext.prototype.generateUploadToken = function (user_id, object_fid) {
        return this.fileProvider.generateToken(user_id, object_fid);
    };
    DbContext.prototype.getUploadTokenData = function (token) {
        var tData = this.fileProvider.getTokenData(token);
        if (tData == AppTypes_1.default.TIME_BANNED)
            return AppTypes_1.default.TIME_BANNED;
        if (tData == AppTypes_1.default.NOT_EXIST)
            return AppTypes_1.default.DENIED;
        return tData;
    };
    DbContext.prototype.getFileStream = function (file_id) {
        var _this = this;
        return this
            .sqlContext.db('disk')
            .query("SELECT mongo_id FROM ?? WHERE id = ?'", ['files', file_id])
            .then(function (res) {
            return _this.mongoContext.readStream(res.mongo_id);
        });
    };
    DbContext.prototype.accessFileExt = function (ext) {
        var ACCESS_LIST = ['.png', '.jpeg', '.jpg', '.pdf'];
        return ACCESS_LIST.includes(ext);
    };
    DbContext.prototype.checkFileAccess = function (user_id, object) {
        var _this = this;
        var wall_parse = String(object).match(/(wall)_([^.]+)/);
        var chat_parse = String(object).match(/(chat)_([^.]+)/);
        var user_parse = String(object).match(/(user)_([^.]+)/);
        return new Promise(function (resolve, reject) {
            if (!wall_parse && !chat_parse && !user_parse)
                return reject(AppTypes_1.default.ERROR);
            if (wall_parse) {
                _this
                    .userProvider
                    .checkSubscribe(user_id, object)
                    .then(function (res) {
                    return res === AppTypes_1.default.SUCCESS
                        ? resolve(AppTypes_1.default.SUCCESS)
                        : _this
                            .wallProvider
                            .checkOwner(wall_parse[2], user_id)
                            .then(function (res) {
                            return res === AppTypes_1.default.SUCCESS
                                ? resolve(AppTypes_1.default.SUCCESS)
                                : resolve(AppTypes_1.default.ERROR);
                        });
                });
            }
            if (chat_parse) {
                _this
                    .userProvider
                    .checkSubscribe(user_id, object)
                    .then(function (res) {
                    return res === AppTypes_1.default.SUCCESS
                        ? resolve(AppTypes_1.default.SUCCESS)
                        : resolve(AppTypes_1.default.ERROR);
                });
            }
            if (user_parse) {
                "user_" + user_id == object
                    ? resolve(AppTypes_1.default.SUCCESS)
                    : resolve(AppTypes_1.default.ERROR);
            }
        });
    };
    DbContext.prototype.uploadFile = function (file_id, file_name, attacher, ext, file) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var m_stream = _this.mongoContext.writeStream(file_id, {});
            file.pipe(m_stream);
            m_stream.on('finish', function () {
                var _this = this;
                this.fileProvider.addFile(file_id, attacher)
                    .then(function (info) {
                    _this.sqlContext.db('disk')
                        .query("INSERT INTO ??\n                    \t (id, name, privacy, type, mongo_id)\n                    \t VALUES (?, ?, ?, ?, ?)", ['files', file_id, file_name, 'public', ext, m_stream.id])
                        .then(function () {
                        resolve("/disk/" + attacher + "/" + file_id);
                    });
                });
            });
        });
    };
    DbContext.prototype.getFileList = function (attacher) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .fileProvider
                .getByOwner(attacher)
                .then(function (res) {
                if (res.length == 0)
                    return resolve([]);
                var files_ids = [];
                res.forEach(function (g_file) {
                    files_ids.push(g_file['file_id']);
                });
                _this
                    .sqlContext
                    .db('disk')
                    .query("SELECT ??, ??, ?? FROM ?? WHERE id IN (?)", ['id', 'name', 'type', 'files', files_ids])
                    .then(function (s_files) {
                    resolve(s_files);
                });
            });
        });
    };
    DbContext.prototype.createUser = function (login, password) {
        var _this = this;
        var new_u = {
            id: this.securityHelper.generateId(),
            login: login, password: password,
            token: this.securityHelper.generateToken(),
            f_token: this.securityHelper.generateToken()
        };
        return new Promise(function (resolve, reject) {
            return _this
                .userProvider
                .insertUser(new_u.id, new_u.login, new_u.password, new_u.token, new_u.f_token)
                .then(function (res) {
                var wall_id = _this.securityHelper.generateId();
                _this
                    .wallProvider
                    .addWall(wall_id, "users:user_" + new_u.id)
                    .then(function () {
                    _this.sqlContext.db('app')
                        .query("UPDATE ?? SET ?? = ? WHERE ?? = ?", ['users', 'wall_id', wall_id, 'id', new_u.id])
                        .then(function () {
                        resolve(AppTypes_1.default.SUCCESS);
                    });
                });
            });
        });
    };
    DbContext.prototype.createChat = function (user_1_id, user_2_id) {
        var _this = this;
        var chat_id = this.securityHelper.generateId();
        return new Promise(function (resolve, reject) {
            _this
                .messageProvider
                .createChat(chat_id, user_1_id, user_2_id)
                .then(function (res) {
                _this.userProvider.subscribeUser(user_1_id, "chats:chat_" + chat_id).then(function (res) {
                    _this.userProvider.subscribeUser(user_2_id, "chats:chat_" + chat_id).then(function (res) {
                        resolve(chat_id);
                    });
                });
            });
        });
    };
    DbContext.prototype.sendMessage = function (chat_id, maker_id, content) {
        var _this = this;
        var time = Date.now();
        return new Promise(function (resolve, reject) {
            _this
                .messageProvider
                .addMessage(chat_id, maker_id, content, time).then(function (res) {
                _this
                    .historyProvider
                    .addEvent('new_message', "user_" + maker_id, "chat_" + chat_id, time)
                    .then(function () {
                    resolve();
                });
            });
        });
    };
    DbContext.prototype.getPage = function (page_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .userProvider
                .checkExistById(page_id)
                .then(function (answer) {
                if (answer == AppTypes_1.default.EMPTY)
                    resolve(AppTypes_1.default.NOT_EXIST);
                else {
                    var page_1 = { wall: {} };
                    _this
                        .userProvider
                        .getPageUserById(answer.id)
                        .then(function (ans) {
                        Object.assign(page_1, ans);
                        _this
                            .wallProvider
                            .getPostsForWall(ans.wall_id, 0)
                            .then(function (posts) {
                            page_1.wall['posts'] = posts;
                            page_1.wall['id'] = ans.wall_id;
                            console.log("Wall id:", page_1.wall['id']);
                            _this
                                .getFileList("walls:wall_" + page_1.wall['id'])
                                .then(function (file_list) {
                                page_1.wall['files'] = file_list;
                                resolve(page_1);
                            });
                        });
                    });
                }
            });
        });
    };
    DbContext.prototype.getMessages = function (user_id, chat_id, offsetLevel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .userProvider
                .checkSubscribe(user_id, "chats:" + chat_id)
                .then(function (res) {
                if (res === AppTypes_1.default.SUCCESS) {
                    _this
                        .messageProvider
                        .getMessagesByChat(chat_id, offsetLevel)
                        .then(function (messages) {
                        var users_ids = [];
                        messages.forEach(function (message) {
                            users_ids.push(message['maker_id']);
                        });
                        _this.userProvider.getPersonsById(users_ids).then(function (persons) {
                            persons.forEach(function (person) {
                                messages.forEach(function (message) {
                                    if (message['maker_id'] == person['id']) {
                                        message['maker_name'] = person['name'];
                                        message['avatar_url'] = person['avatar_url'];
                                    }
                                });
                            });
                            resolve(messages);
                        });
                    });
                }
                else {
                    return AppTypes_1.default.ERROR;
                }
            });
        });
    };
    return DbContext;
}());
exports.default = DbContext;
