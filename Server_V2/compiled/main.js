"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Store = require("data-store");
var GooglePhoneLib = require("google-libphonenumber");
var http = require("http");
var express = require("express");
var busboy = require("connect-busboy");
var socketIo = require("socket.io");
var path = require("path");
var config = require('./config.json');
var SocketContext_1 = require("./core/SocketContext");
var DbContext_1 = require("./core/DbContext");
var MongoContext_1 = require("./core/MongoContext");
var SqlContext_1 = require("./core/SqlContext");
var SecurityHelper_1 = require("./helpers/SecurityHelper");
var AppTypes_1 = require("./core/AppTypes");
var AuthRepository_1 = require("./core/AuthRepository");
var SmsProvider_1 = require("./providers/SmsProvider");
var smsProvider = new SmsProvider_1.default();
var sqlContext = new SqlContext_1.default();
var readChunk = require('read-chunk');
var fileType = require('file-type');
var securityHelper = new SecurityHelper_1.default();
var store = new Store({ path: 'phones.json' });
var PNF = GooglePhoneLib.PhoneNumberFormat;
var phoneUtil = GooglePhoneLib.PhoneNumberUtil.getInstance();
var app = express();
app.use(busboy());
var server = http.createServer(app);
server.listen(config.server.port);
var io = socketIo(server);
var mongoContext = new MongoContext_1.default();
var dbContext = new DbContext_1.default(mongoContext, sqlContext);
var authRepository = new AuthRepository_1.default(dbContext);
var socketContext = new SocketContext_1.default(io, dbContext, authRepository);
var truePhone = function (phoneNum) {
    return phoneUtil.format(phoneUtil.parse(phoneNum.toString(), 'RU'), PNF.E164);
};
var checkInStore = function (phone) {
    return !!store.get(String(phone));
};
app.get('/auth/login', function (req, res) {
    authRepository
        .login(req.url.params.login, req.url.params.password)
        .then(function (result) {
        if (result === AppTypes_1.default.DENIED) {
            res.status = 403;
            res.end('Access denied');
        }
        else if (typeof (result) === 'string') {
            res.status = 200;
            res.cookie.set('t', result);
            res.end(result);
        }
    });
});
app.get('/auth/signup', function (req, res) {
    authRepository
        .signup(req.url.params.login, req.url.params.password)
        .then(function (result) {
        if (result === AppTypes_1.default.EXIST) {
            res.status = 403;
            res.end("User exist");
        }
        else if (typeof (result) === 'string') {
            res.status = 200;
            res.cookie.set('t', result);
            res.end("Signup success");
        }
    });
});
app.get('/app', function (req, res) {
    if (req.cookie.t) {
        var status_1 = authRepository.checkToken(req.cookie.t);
        if (status_1 === AppTypes_1.default.NOT_EXIST) {
            res.status = 403;
            res.end("Token failed");
        }
        else if (status_1 === AppTypes_1.default.TIME_BANNED) {
            res.status = 403;
            res.end("Time banned");
        }
        else if (status_1 === AppTypes_1.default.SUCCESS) {
            res.status = 200;
            res.sendFile(path.join(__dirname, '../public', 'index.html'));
            res.cookie.set("t", authRepository.updateToken(req.cookie.t));
        }
    }
});
app.get('/disk/:object_fid/:file_id', function (req, res) {
});
app.get('/disk/wall_*/:file_id', function (req, res) {
    dbContext
        .getFileSteam(req.params['file_id'])
        .then(function (stream) {
        stream.pipe(res);
    });
});
app.post('/disk/upload/:access_token', function (req, res) {
    var access_token = req.params.access_token;
    var tokenData = dbContext.getUploadTokenData(access_token);
    if (tokenData == AppTypes_1.default.DENIED) {
        res.status = 403;
        res.end('Access denied');
    }
    else if (tokenData == AppTypes_1.default.TIME_BANNED) {
        res.status = 403;
        res.end('Time banned');
    }
    else {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, file_name) {
            var ext = fileType(file)['ext'];
            var ext_true = dbContext.accessFileExt(ext);
            var file_id = "" + securityHelper.generateFileId();
            if (ext_true) {
                dbContext
                    .uploadFile(file_id, file_name, tokenData['object_fid'], ext, file)
                    .then(function (result) {
                    res.status = 200;
                    res.send(result);
                })
                    .catch(function (err) {
                    res.status = 403;
                    res.end('Error');
                });
            }
            else {
                res.status = 403;
                res.end = 'Ext failed';
            }
        });
    }
});
process.on('uncaughtException', function (err) {
    console.log(err);
});
