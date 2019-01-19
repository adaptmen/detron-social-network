"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Store = require("data-store");
var GooglePhoneLib = require("google-libphonenumber");
var http = require("http");
var config = require('./config.json');
var express = require("express");
var busboy = require("connect-busboy");
var socketIo = require("socket.io");
var SocketContext_1 = require("./core/SocketContext");
var DbContext_1 = require("./core/DbContext");
var MongoContext_1 = require("./core/MongoContext");
var SecurityHelper_1 = require("./helpers/SecurityHelper");
var AppRepository_1 = require("./core/AppRepository");
var FileDataProvider_1 = require("./providers/FileDataProvider");
var SmsProvider_1 = require("./providers/SmsProvider");
var appRepository = new AppRepository_1.default();
var smsProvider = new SmsProvider_1.default();
var fileProvider = new FileDataProvider_1.default();
var securityHelper = new SecurityHelper_1.default();
var store = new Store({ path: 'phones.json' });
var PNF = GooglePhoneLib.PhoneNumberFormat;
var phoneUtil = GooglePhoneLib.PhoneNumberUtil.getInstance();
appRepository.takeSnapshot();
app.use(busboy());
var app = express();
var server = http.createServer(app);
var io = socketIo(server);
server.listen(config.server.port);
var mongoContext = new MongoContext_1.default();
var dbContext = new DbContext_1.default(mongoContext, appRepository);
var socketContext = new SocketContext_1.default(io, appRepository, dbContext, mongoContext);
var truePhone = function (phoneNum) {
    return phoneUtil.format(phoneUtil.parse(phoneNum.toString(), 'RU'), PNF.E164);
};
var checkExistPhone = function (phone) {
    return appRepository.checkInAuth(phone);
};
var checkInStore = function (phone) {
    return !!store.get(String(phone));
};
appRepository.onInit = function () {
    app.all('/auth/number', function (req, res) {
        var phone = truePhone(req.query.phone);
        var smsCode = securityHelper.generateSmsCode();
        if (checkInStore(phone)) {
            var countTrue = (Number(store.get(phone + ".count")) > 0);
            var timeTrue = (Number(store.get(phone + ".allow_date")) <= Date.now());
            if (countTrue && timeTrue) {
                store.set(phone + ".count", String(Number(store.get(phone + ".count")) - 1));
                store.set(phone + ".code", String(smsCode));
                smsProvider
                    .sendSms(phone, smsCode)
                    .then(function (body) {
                    if (body.match('OK')) {
                        res.send({ code: 'count', answer: { count: Number(store.get(phone + ".count")) } });
                    }
                    else {
                        res.send({ code: 'code', answer: 'error' });
                    }
                });
            }
            else if (countTrue && !timeTrue) {
                res.send({ code: 'date', answer: { date: Number(store.get(phone + ".allow_date")) - Date.now() } });
            }
            else if (!countTrue && timeTrue) {
                var allow_date = Date.now() + 1000 * 60 * 60 * 24;
                store.set(phone + ".allow_date", String(allow_date));
                store.set(phone + ".count", 3);
                res.send({ code: 'date', answer: { date: Number(store.get(phone + ".allow_date")) - Date.now() } });
            }
            else {
                res.send({ code: 'date', answer: { date: Number(store.get(phone + ".allow_date")) - Date.now() } });
            }
        }
        else {
            store.set(String(phone + '.code'), smsCode);
            store.set(String(phone + '.count'), String(3));
            store.set(String(phone + '.allow_date'), String(Date.now()));
            smsProvider
                .sendSms(phone, smsCode)
                .then(function (body) {
                if (body.match('OK')) {
                    res.send({ code: "first", answer: { status: 'allow' } });
                }
                else {
                    res.send({ answer: 'error' });
                }
            })
                .catch(function (err) {
                console.log(err);
            });
        }
    });
    app.all('/auth/code', function (req, res) {
        var params = req.query;
        console.log(params);
        params.phone = truePhone(params.phone);
        if (!checkInStore(params.phone)) {
            res.send({ code: "first", answer: { status: 'allow' } });
            return 0;
        }
        var countTrue = (Number(store.get(params.phone + ".count")) > 0);
        var codeTrue = (params.code == store.get(params.phone + ".code"));
        var timeTrue = (Number(store.get(params.phone + ".allow_date")) <= Date.now());
        if (countTrue && codeTrue && timeTrue) {
            var token_1 = securityHelper.generateToken();
            var ftoken = securityHelper.generateLongId();
            if (dbContext.checkByPhone(params.phone)) {
                console.log('Main: user existed');
                var authUser = appRepository.authList[params.phone];
                res.send({ code: "cred", answer: { phone: params.phone, token: authUser.token } });
            }
            else {
                dbContext
                    .createUser(params.phone, token_1, ftoken)
                    .then(function (result) {
                    if (result == "user created") {
                        res.send({ code: "cred", answer: { phone: params.phone, token: token_1 } });
                    }
                }).catch(function (error) { console.log(error); });
            }
        }
        else if (countTrue && !codeTrue && timeTrue) {
            store.set(params.phone + ".count", String(Number(store.get(params.phone + ".count")) - 1));
            res.send({ code: "count", answer: { count: Number(store.get(params.phone + ".count")) } });
        }
        else if ((!countTrue && codeTrue && timeTrue) || (!countTrue && !codeTrue && timeTrue)) {
            var allow_date = Date.now() + 1000 * 60 * 60 * 24;
            store.set(params.phone + ".allow_date", String(allow_date));
            store.set(params.phone + ".count", 3);
            res.send({ code: 'date', answer: { date: Number(store.get(params.phone + ".allow_date")) - Date.now() } });
        }
        else if (countTrue && !timeTrue) {
            res.send({ code: 'date', answer: { date: Number(store.get(params.phone + ".allow_date")) - Date.now() } });
        }
    });
    app.get('/file/:fid', function (req, res) {
        var f_id = req.params.fid;
        fileProvider.getFile(f_id).then(function (file_info) {
            console.log("File info: ", file_info);
            var m_stream = mongoContext.readStream(file_info[0].mongo_id);
            m_stream.pipe(res);
        });
    });
    app.post('/upload/:f_token', function (req, res) {
        var f_token = req.params.f_token;
        console.log('Access token: ', f_token);
        var access_info = fileProvider.checkToken(f_token);
        if (access_info) {
            req.pipe(req.busboy);
            req.busboy.on('file', function (fieldname, file, f_name) {
                var filename = "" + securityHelper.generateFileId();
                var m_stream = mongoContext.writeStream(filename, {});
                console.log("Uploading: " + filename);
                file.pipe(m_stream);
                m_stream.on('finish', function () {
                    console.log("Upload finished of " + filename);
                    fileProvider.addFile(filename, access_info.user_id, access_info.privacy, m_stream.id)
                        .then(function (info) {
                        res.send({ code: "upload", answer: { file_id: filename } });
                    });
                });
            });
        }
        else {
            res.send({ code: "upload", answer: { message: "token error" } });
        }
    });
    app.all('/login', function (req, res) {
        var params = req.query;
        params.phone = truePhone(params.phone);
        dbContext.loginUser(params.phone, params.token) == 'allow'
            ? res.send({ code: "login", answer: 'allow' })
            : res.send({ code: "login", answer: 'not allow' });
    });
    process.on('uncaughtException', function (err) {
        console.log(err);
    });
};
