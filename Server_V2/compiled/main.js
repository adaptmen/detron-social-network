"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Store = require("data-store");
var GooglePhoneLib = require("google-libphonenumber");
var http = require("http");
var express = require("express");
var busboy = require("connect-busboy");
var Cookies = require("cookies");
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
var auth_route = express.Router({ strict: true });
auth_route.get('/', function (req, res) {
    res.status = 200;
    res.sendFile(path.join(__dirname, './public', 'Auth.html'));
});
auth_route.post('/login', function (req, res) {
    console.log("Login params: ", req.query.login, req.query.password);
    authRepository
        .login(req.query.login, req.query.password)
        .then(function (result) {
        console.log("Login result: ", result);
        if (result === AppTypes_1.default.DENIED) {
            res.status = 403;
            res.end('Access denied');
        }
        else if (typeof (result) === 'string') {
            res.status = 200;
            var cookies = new Cookies(req, res);
            cookies.set('t', result, { expires: new Date(Date.now() + 1000 * 60 * 60) });
            res.end(result);
        }
    });
});
auth_route.post('/signup', function (req, res) {
    console.log("Signup:", req.query.login, req.query.password);
    authRepository
        .signup(req.query.login, req.query.password)
        .then(function (result) {
        console.log("Signup result: ", result);
        if (result === AppTypes_1.default.EXIST) {
            res.status = 403;
            res.end("User exist");
        }
        else if (typeof (result) === 'string') {
            res.status = 200;
            var cookies = new Cookies(req, res);
            cookies.set('t', result, { expires: new Date(Date.now() + 1000 * 60 * 60) });
            res.redirect('/app');
        }
    });
});
app.use('/auth', auth_route);
var app_route = express.Router({ strict: true });
app_route.get('/*', function (req, res) {
    var cookies = new Cookies(req, res);
    if (cookies.get('t')) {
        var status_1 = authRepository.checkToken(cookies.get('t'));
        if (status_1 === AppTypes_1.default.NOT_EXIST) {
            cookies.set('t', '');
            res.status = 403;
            res.redirect('/auth');
        }
        else if (status_1 === AppTypes_1.default.TIME_BANNED) {
            cookies.set('t', '');
            res.status = 403;
            res.redirect('/auth');
        }
        else if (status_1 === AppTypes_1.default.SUCCESS) {
            cookies.set("t", authRepository.updateToken(cookies.get('t')), { expires: new Date(Date.now() + 1000 * 60 * 60) });
            res.status = 200;
            res.sendFile(path.join(__dirname, './public', 'index.html'));
        }
    }
    else {
        res.redirect('/auth');
    }
});
app.use('/app', app_route);
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './public', 'Present.html'));
});
app.get('/*.js', function (req, res) {
    res.sendFile(path.join(__dirname, './public', req.params['0'] + ".js"));
});
app.get('/*.css', function (req, res) {
    res.sendFile(path.join(__dirname, './public', req.params['0'] + ".css"));
});
app.get('/*.map', function (req, res) {
    res.sendFile(path.join(__dirname, './public', req.params['0'] + ".map"));
});
app.get('/*.ico', function (req, res) {
    res.sendFile(path.join(__dirname, './public', req.params['0'] + ".ico"));
});
app.get('/*.ttf', function (req, res) {
    res.sendFile(path.join(__dirname, './public/fonts/', req.params['0'] + ".ttf"));
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
