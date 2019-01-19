"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var DB_URL = "localhost:27017";
var DB_NAME = "local";
var MongoContext = (function () {
    function MongoContext() {
        var _this = this;
        this.MongoId = mongo.ObjectID;
        MongoClient.connect("mongodb://" + DB_URL + "/" + DB_NAME, {
            native_parser: true,
            useNewUrlParser: true
        }, function (err, client) {
            _this.db = client.db(DB_NAME);
            _this.bucket = new mongo.GridFSBucket(_this.db);
            console.log('mongo started');
        });
    }
    MongoContext.prototype.writeStream = function (fileName, options) {
        return this.bucket.openUploadStream(fileName, options);
    };
    MongoContext.prototype.readStream = function (m_fileId) {
        return this.bucket.openDownloadStream(m_fileId);
    };
    MongoContext.prototype.find = function (collection, searchOptions) {
        var _this = this;
        if (this.db) {
            return new Promise(function (resolve, reject) {
                _this
                    .db
                    .collection(collection)
                    .find(searchOptions.props, searchOptions.agregates || {})
                    .toArray(function (err, results) {
                    if (!err) {
                        if (!results.length) {
                            resolve(results);
                            return;
                        }
                        else if (results.length === 1) {
                            results = results[0];
                        }
                        resolve(results);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        }
    };
    MongoContext.prototype.findOne = function (collection, searchOptions) {
        var _this = this;
        if (this.db) {
            return new Promise(function (resolve, reject) {
                _this
                    .db
                    .collection(collection)
                    .findOne(searchOptions.props, searchOptions.agregates || {})
                    .toArray(function (err, results) {
                    if (!err) {
                        if (!results.length) {
                            resolve(results);
                            return;
                        }
                        else if (results.length === 1) {
                            results = results[0];
                        }
                        resolve(results);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        }
    };
    MongoContext.prototype.insertOne = function (collection, data) {
        var _this = this;
        if (this.db) {
            return new Promise(function (resolve, reject) {
                _this.db.collection(collection).insertOne(data, function (err, result) {
                    if (!err) {
                        resolve(result);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        }
    };
    MongoContext.prototype.updateOne = function (collection, filters) {
        var _this = this;
        if (this.db) {
            return new Promise(function (resolve, reject) {
                _this
                    .db
                    .collection(collection)
                    .updateOne(filters.props, filters.agregates || {}, function (err, result) {
                    if (!err) {
                        resolve(result);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        }
    };
    return MongoContext;
}());
exports.default = MongoContext;
