"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Store = require("data-store");
var GooglePhoneLib = require("google-libphonenumber");
var http = require("http");
var https = require("https");
var express = require("express");
var busboy = require("connect-busboy");
var Cookies = require("cookies");
var socketIo = require("socket.io");
var FileType = require('stream-file-type');
var file_type_stream_1 = require("file-type-stream");
var stream_1 = require("stream");
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
var securityHelper = new SecurityHelper_1.default();
var store = new Store({ path: 'phones.json' });
var PNF = GooglePhoneLib.PhoneNumberFormat;
var phoneUtil = GooglePhoneLib.PhoneNumberUtil.getInstance();
var app = express();
app.use(busboy());
var privateKey = fs.readFileSync('/etc/letsencrypt/live/detron.tech/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/detron.tech/cert.pem', 'utf8');
var ca = fs.readFileSync('/etc/letsencrypt/live/detron.tech/chain.pem', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, function () {
    console.log('HTTPS Server running on port 443');
});
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);
var io = socketIo(httpsServer);
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
        else if (!isNaN(result) && result) {
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
app.get('/assets/*', function (req, res) {
    res.sendFile(path.join(__dirname, './public/assets', "" + req.params['0']));
});
app.get('/*.ttf', function (req, res) {
    try {
        res.sendFile(path.join(__dirname, './public/', req.params['0'] + ".ttf"));
    }
    catch (e) {
        res.sendFile(path.join(__dirname, './public/assets/', req.params['0'] + ".ttf"));
    }
});
app.get('/*.png', function (req, res) {
    try {
        res.sendFile(path.join(__dirname, './public/', req.params['0'] + ".png"));
    }
    catch (e) {
        res.sendFile(path.join(__dirname, './public/assets/', req.params['0'] + ".png"));
    }
});
app.get('/*.jpg', function (req, res) {
    try {
        res.sendFile(path.join(__dirname, './public/', req.params['0'] + ".jpg"));
    }
    catch (e) {
        res.sendFile(path.join(__dirname, './public/assets/', req.params['0'] + ".jpg"));
    }
});
app.get('/*.jpeg', function (req, res) {
    try {
        res.sendFile(path.join(__dirname, './public/', req.params['0'] + ".jpeg"));
    }
    catch (e) {
        res.sendFile(path.join(__dirname, './public/assets/', req.params['0'] + ".jpeg"));
    }
});
app.get('/.well-known/*', function (req, res) {
    res.sendFile(path.join(__dirname, './.well-known/', "" + req.params['0']));
});
app.get('/disk/wall_*/:file_id', function (req, res) {
    dbContext
        .getFileStream(req.params['file_id'])
        .then(function (stream) {
        stream.pipe(res);
    });
});
app.post('/disk/attach-file/:a_token', function (req, res) {
    var a_token = req.params.a_token;
    dbContext
        .attachFile(a_token)
        .then(function () {
        res.status = 200;
        res.send({ ans: 'ok' });
    })
        .catch(function () {
        res.status = 403;
        res.end("Error");
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
        req.busboy.on('file', function (fieldname, file, file_name, encoding, mimetype) {
            var through = new stream_1.PassThrough();
            file.pipe(file_type_stream_1.default(function (fileType) {
                console.log(fileType);
                if (fileType !== null) {
                    var ext = fileType['ext'];
                    var ext_true = dbContext.accessFileExt(ext);
                    var file_id = "" + securityHelper.generateFileId();
                    if (ext_true) {
                        dbContext
                            .uploadFile(file_id, file_name, tokenData['object_fid'], ext, through)
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
                        res.end('Error');
                    }
                }
                else {
                    res.status = 403;
                    res.end('Error');
                }
            })).pipe(through);
        });
    }
});
process.on('uncaughtException', function (err) {
    console.log(err);
});
