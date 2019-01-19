"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityHelper_1 = require("../helpers/SecurityHelper");
var FileDataProvider_1 = require("../providers/FileDataProvider");
var ChatDataProvider_1 = require("../providers/ChatDataProvider");
var HistoryDataProvider_1 = require("../providers/HistoryDataProvider");
var MessageDataProvider_1 = require("../providers/MessageDataProvider");
var UserDataProvider_1 = require("../providers/UserDataProvider");
var WallDataProvider_1 = require("../providers/WallDataProvider");
var GroupDataProvider_1 = require("../providers/GroupDataProvider");
var Wall_1 = require("../models/Wall");
var PostDataProvider_1 = require("../providers/PostDataProvider");
var HistoryEvent_1 = require("../models/HistoryEvent");
var HistoryEventTypes_1 = require("./HistoryEventTypes");
var RequestTypes_1 = require("./RequestTypes");
var Chat_1 = require("../models/Chat");
var DbContext = (function () {
    function DbContext(mongoContext, appRepository) {
        this.messageProvider = new MessageDataProvider_1.default();
        this.historyProvider = new HistoryDataProvider_1.default();
        this.userProvider = new UserDataProvider_1.default();
        this.chatProvider = new ChatDataProvider_1.default();
        this.wallProvider = new WallDataProvider_1.default();
        this.fileProvider = new FileDataProvider_1.default();
        this.groupProvider = new GroupDataProvider_1.default();
        this.postProvider = new PostDataProvider_1.default();
        this.securityHelper = new SecurityHelper_1.default();
        this.mongoContext = mongoContext;
        this.appRepository = appRepository;
    }
    DbContext.prototype.createUser = function (phone, token, ftoken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var newId = _this.securityHelper.generateId();
            _this.userProvider.insertUser(newId, phone, token, ftoken)
                .then(function (result) {
                _this.appRepository.createUser({
                    id: newId,
                    phone: phone,
                    name: phone,
                    token: token
                });
                _this.wallProvider.addWall(new Wall_1.default(newId)).then(function () {
                    resolve("user created");
                });
            });
        });
    };
    DbContext.prototype.loginUser = function (phone, token) {
        return this.appRepository.checkUser(phone, token)
            ? "allow"
            : "not allow";
    };
    DbContext.prototype.checkByPhone = function (phone) {
        return this.appRepository.checkInAuth(phone);
    };
    DbContext.prototype.createMessage = function (message) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .mongoContext
                .insertOne('messages', {
                id: message.id,
                content: message.content
            })
                .then(function (info) {
                delete message.content;
                message.mongo_id = info['insertedId'];
                _this
                    .messageProvider
                    .addMessage(message)
                    .then(function () {
                    var chat_event = new HistoryEvent_1.default(message.chat_id, message.id, HistoryEventTypes_1.default.NEW_MESSAGE, message.time);
                    var user_event = new HistoryEvent_1.default(message.maker_id, chat_event.id, HistoryEventTypes_1.default.HISTORY_EVENT, message.time);
                    _this.appRepository.historyCache.addEvent(chat_event);
                    _this.appRepository.historyCache.addEvent(user_event);
                    resolve();
                });
            });
        });
    };
    DbContext.prototype.createGroup = function (group, wall) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .wallProvider
                .addWall(wall)
                .then(function () {
                _this
                    .groupProvider
                    .addGroup(group)
                    .then(function () { resolve(); }, function (err) { reject(err); });
            });
        });
    };
    DbContext.prototype.createPost = function (post) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .mongoContext
                .insertOne('posts', { id: post.id, content: post.content })
                .then(function (info) {
                post.mongo_id = info.insertedId;
                _this
                    .postProvider
                    .addPost(post)
                    .then(function () {
                    var wall_event = new HistoryEvent_1.default("walls:wall_" + post.wall_id, "posts:post_" + post.id, HistoryEventTypes_1.default.NEW_POST, post.time);
                    var owner_event = new HistoryEvent_1.default(post.owner, wall_event.id, HistoryEventTypes_1.default.HISTORY_EVENT, post.time);
                    _this
                        .historyProvider
                        .addEvent(wall_event)
                        .then(function () {
                        _this
                            .historyProvider
                            .addEvent(owner_event)
                            .then(function () {
                            resolve();
                        });
                    });
                });
            });
        });
    };
    DbContext.prototype.openChat = function (user_id, companion_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.chatProvider.checkChat(user_id, companion_id).then(function (exist) {
                if (!exist) {
                    var new_chat_1 = new Chat_1.default(user_id, companion_id);
                    _this
                        .chatProvider
                        .addChat(new_chat_1.id)
                        .then(function () {
                        _this
                            .userProvider
                            .subscribeUser(user_id, "chats:chat_" + new_chat_1.id)
                            .then(function () {
                            _this
                                .userProvider
                                .subscribeUser(companion_id, "chats:chat_" + new_chat_1.id)
                                .then(function () {
                                resolve(new_chat_1.id);
                            });
                        });
                    });
                }
                else {
                    _this
                        .chatProvider
                        .getChatId(user_id, companion_id)
                        .then(function (chats) {
                        resolve(chats[0].chat_id);
                    });
                }
            });
        });
    };
    DbContext.prototype.getWall = function (wall_id, offsetLevel, user_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .postProvider
                .getPostsForWall(wall_id, offsetLevel)
                .then(function (posts) {
                var _loop_1 = function (i) {
                    posts[i].owner_id = posts[i].owner_role + posts[i].owner_id;
                    delete posts[i].owner_role;
                    _this
                        .mongoContext
                        .findOne('posts', {
                        '_id': _this.mongoContext.MongoId(posts[i]['mongo_id'])
                    })
                        .then(function (m_post) {
                        delete posts[i]['mongo_id'];
                        posts[i].content = m_post.content;
                        if (!_this.appRepository.watchCache.checkWatch(user_id, "posts:post_" + posts[i].id)) {
                            _this
                                .postProvider
                                .watchPost(user_id, posts[i].id)
                                .then(function () {
                                var post_watch_event = new HistoryEvent_1.default("users:user_" + user_id, "posts:post_" + posts[i].id, HistoryEventTypes_1.default.WATCH, Date.now());
                                _this
                                    .historyProvider
                                    .addEvent(post_watch_event)
                                    .then(function () {
                                    _this
                                        .appRepository
                                        .historyCache
                                        .addEvent(post_watch_event);
                                    _this
                                        .appRepository
                                        .watchCache
                                        .addWatch(user_id, "posts:post_" + posts[i].id, post_watch_event.time);
                                });
                            });
                        }
                    });
                    if (i == posts.length - 1) {
                        _this
                            .wallProvider
                            .getOwnerInfo(wall_id)
                            .then(function (owner_info) {
                            resolve({
                                owner_info: owner_info,
                                posts: posts
                            });
                        });
                    }
                };
                for (var i = 0; i < posts.length; i++) {
                    _loop_1(i);
                }
                var watch_event = new HistoryEvent_1.default("users:user_" + user_id, "walls:wall_" + wall_id, HistoryEventTypes_1.default.WATCH, Date.now());
                _this
                    .historyProvider
                    .addEvent(watch_event)
                    .then(function () {
                    _this
                        .appRepository
                        .historyCache
                        .addEvent(watch_event);
                });
            });
        });
    };
    DbContext.prototype.getNews = function (user_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .userProvider
                .getNews(user_id, _this
                .appRepository
                .usersCache
                .getUser(user_id)['offsetLevelNews'])
                .then(function (posts) {
                var _loop_2 = function (i) {
                    _this
                        .mongoContext
                        .findOne('posts', {
                        '_id': _this.mongoContext.MongoId(posts[i]['mongo_id'])
                    })
                        .then(function (m_post) {
                        delete posts[i]['mongo_id'];
                        posts[i].content = m_post.content;
                        if (!_this.appRepository.watchCache.checkWatch(user_id, "posts:post_" + posts[i].id)) {
                            _this
                                .postProvider
                                .watchPost(user_id, posts[i].id)
                                .then(function () {
                                var post_watch_event = new HistoryEvent_1.default("users:user_" + user_id, "posts:post_" + posts[i].id, HistoryEventTypes_1.default.WATCH, Date.now());
                                _this
                                    .historyProvider
                                    .addEvent(post_watch_event)
                                    .then(function () {
                                    _this
                                        .appRepository
                                        .historyCache
                                        .addEvent(post_watch_event);
                                    _this
                                        .appRepository
                                        .watchCache
                                        .addWatch(user_id, "posts:post_" + posts[i].id, post_watch_event.time);
                                });
                            });
                        }
                    });
                    if (i == posts.length - 1) {
                        var news_watch_event_1 = new HistoryEvent_1.default("users:user_" + user_id, "news:user_" + user_id, HistoryEventTypes_1.default.WATCH, Date.now());
                        _this
                            .historyProvider
                            .addEvent(news_watch_event_1).then(function () {
                            _this
                                .appRepository
                                .historyCache
                                .addEvent(news_watch_event_1);
                            resolve(posts);
                        });
                    }
                };
                for (var i = 0; i < posts.length; i++) {
                    _loop_2(i);
                }
            });
        });
    };
    DbContext.prototype.getMessage = function (message_id, chat_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .messageProvider
                .getMessageById(message_id, chat_id)
                .then(function (message) {
                _this
                    .mongoContext
                    .findOne('messages', {
                    '_id': _this.mongoContext.MongoId(message.mongo_id)
                })
                    .then(function (m_message) {
                    delete message.mongo_id;
                    message.content = m_message.content;
                    resolve(message);
                });
            });
        });
    };
    DbContext.prototype.getMessages = function (chat_id, user_id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var result_messages = [];
            var offsetLevel = _this
                .appRepository
                .usersCache
                .getUser(user_id)['offsetLevelMessage'];
            _this
                .messageProvider
                .getMessagesByChat(chat_id, offsetLevel)
                .then(function (messages) {
                var _loop_3 = function (i) {
                    _this
                        .mongoContext
                        .findOne('messages', {
                        '_id': _this.mongoContext.MongoId(messages[i].mongo_id)
                    })
                        .then(function (m_message) {
                        delete messages[i].mongo_id;
                        messages[i].content = m_message.content;
                    });
                    if (i == messages.length - 1) {
                        _this
                            .mongoContext
                            .findOne('messages', {
                            '_id': _this.mongoContext.MongoId(messages[i].mongo_id)
                        })
                            .then(function (m_message) {
                            delete messages[i].mongo_id;
                            messages[i].content = m_message.content;
                            _this.appRepository.usersCache.setUserInfo(user_id, 'offsetLevelMessage', offsetLevel + 1);
                            resolve(messages);
                        });
                    }
                };
                for (var i = 0; i < messages.length; i++) {
                    _loop_3(i);
                }
            });
        });
    };
    DbContext.prototype.updateUserData = function (user_id, update_data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!update_data.id && !update_data.token && !update_data.phone) {
                var addProps_1 = {};
                var replaceProps = {};
                var addSuccess_1 = false;
                var replaceSuccess_1 = false;
                for (var key in update_data) {
                    if (_this.appRepository.usersCache[user_id][key]) {
                        replaceProps[key] = update_data[key];
                    }
                    else {
                        addProps_1[key] = update_data[key];
                    }
                }
                if (JSON.stringify(addProps_1) === '{}') {
                    addSuccess_1 = true;
                }
                if (JSON.stringify(replaceProps) === '{}') {
                    replaceSuccess_1 = true;
                }
                if (addSuccess_1 && replaceSuccess_1) {
                    resolve(RequestTypes_1.default.SUCCESS);
                }
                if (!addSuccess_1) {
                    _this
                        .userProvider
                        .addInfo(user_id, addProps_1)
                        .then(function (res) {
                        addSuccess_1 = true;
                        if (addSuccess_1 && replaceSuccess_1) {
                            for (var key in addProps_1) {
                                _this.appRepository.usersCache.setUserInfo(user_id, key, addProps_1[key]);
                            }
                            resolve(RequestTypes_1.default.SUCCESS);
                        }
                    });
                }
                if (!replaceSuccess_1) {
                    var isError_1 = false;
                    var i_1 = 0;
                    var length_1 = Object.keys(replaceProps).length;
                    for (var key in replaceProps) {
                        _this.appRepository.usersCache.setUserInfo(user_id, key, replaceProps[key]);
                        _this
                            .userProvider
                            .replaceInfo(user_id, key, replaceProps[key])
                            .then(function (res) {
                            i_1++;
                            if (i_1 == length_1) {
                                replaceSuccess_1 = true;
                                if (addSuccess_1 && replaceSuccess_1) {
                                    resolve(RequestTypes_1.default.SUCCESS);
                                }
                            }
                        }, function (err) { isError_1 = true; });
                    }
                }
                var update_event_1 = new HistoryEvent_1.default("users:user_" + user_id, "users:user_" + user_id, HistoryEventTypes_1.default.UPDATE_USER_DATA, Date.now());
                _this.historyProvider.addEvent(update_event_1).then(function () {
                    _this.appRepository.historyCache.addEvent(update_event_1);
                });
            }
            else {
                resolve(RequestTypes_1.default.ERROR);
            }
        });
    };
    return DbContext;
}());
exports.default = DbContext;
