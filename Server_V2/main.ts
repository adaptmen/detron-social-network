import fs = require('fs');
import Store = require('data-store');
import GooglePhoneLib = require('google-libphonenumber');
import http = require('http');
import express = require('express');
import busboy = require('connect-busboy');
import Cookies = require('cookies');
import * as socketIo from 'socket.io';

import path = require("path");
var config = require('./config.json');

import SocketContext from './core/SocketContext';
import DbContext from './core/DbContext';
import MongoContext from './core/MongoContext';
import SqlContext from './core/SqlContext';
import SecurityHelper from './helpers/SecurityHelper';
import AppTypes from './core/AppTypes';

import AuthRepository from './core/AuthRepository';
import SmsProvider from './providers/SmsProvider';

var smsProvider = new SmsProvider();
var sqlContext = new SqlContext();

const readChunk = require('read-chunk');
const fileType = require('file-type');

var securityHelper = new SecurityHelper();
var store = new Store({ path: 'phones.json' });
var PNF = GooglePhoneLib.PhoneNumberFormat;
var phoneUtil = GooglePhoneLib.PhoneNumberUtil.getInstance();

var app = express();

app.use(busboy());

var server = http.createServer(app);
server.listen(config.server.port);

var io: socketIo.Server = socketIo(server);

var mongoContext: MongoContext = new MongoContext();
var dbContext: DbContext = new DbContext(mongoContext, sqlContext);
var authRepository = new AuthRepository(dbContext);
var socketContext: SocketContext = new SocketContext(io, dbContext, authRepository);

const truePhone = (phoneNum) => {
    return phoneUtil.format(phoneUtil.parse(phoneNum.toString(), 'RU'), PNF.E164);
};

const checkInStore = (phone) => {
    return !!store.get(String(phone));
};


var auth_route = express.Router({strict: true});

auth_route.get('/', (req, res) => {
    res.status = 200;
    res.sendFile(path.join(__dirname, './public', 'Auth.html'));
});

auth_route.post('/login', (req, res) => {
    console.log("Login params: ", req.query.login, req.query.password);
    authRepository
    .login(req.query.login, req.query.password)
    .then((result) => {
        console.log("Login result: ", result);
        if (result === AppTypes.DENIED) {
            res.status = 403;
            res.end('Access denied');
        }
        else if (typeof(result) === 'string') {
            res.status = 200;
            let cookies = new Cookies(req, res);
            cookies.set('t', result, { expires: new Date(Date.now() + 1000*60*60) });
            res.end(result);
        }
    });
});

auth_route.post('/signup', (req, res) => {
    console.log("Signup:", req.query.login, req.query.password);
    authRepository
    .signup(req.query.login, req.query.password)
    .then((result) => {
        console.log("Signup result: ", result);
        if (result === AppTypes.EXIST) {
            res.status = 403;
            res.end("User exist");
        }
        else if (typeof(result) === 'string') {
            res.status = 200;
            let cookies = new Cookies(req, res);
            cookies.set('t', result, { expires: new Date(Date.now() + 1000*60*60) });
            res.redirect('/app');
        }
    });
});

app.use('/auth', auth_route);

var app_route = express.Router({strict: true});

app_route.get('/*', (req, res) => {
    let cookies = new Cookies(req, res);
    if (cookies.get('t')) {
        let status = authRepository.checkToken(cookies.get('t'));
        if (status === AppTypes.NOT_EXIST) {
            cookies.set('t', '');
            res.status = 403;
            res.redirect('/auth');
        }
        else if (status === AppTypes.TIME_BANNED) {
            cookies.set('t', '');
            res.status = 403;
            res.redirect('/auth');
        }
        else if (status === AppTypes.SUCCESS) {
            cookies.set("t", authRepository.updateToken(cookies.get('t')), { expires: new Date(Date.now() + 1000*60*60) });
            res.status = 200;
            res.sendFile(path.join(__dirname, './public', 'index.html'));
        }
    }
    else {
        res.redirect('/auth');
    }
})

app.use('/app', app_route);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'Present.html'));
});

app.get('/*.js', (req, res) => {
    res.sendFile(path.join(__dirname, './public', `${req.params['0']}.js`));
});

app.get('/*.css', (req, res) => {
    res.sendFile(path.join(__dirname, './public', `${req.params['0']}.css`));
});

app.get('/*.map', (req, res) => {
    res.sendFile(path.join(__dirname, './public', `${req.params['0']}.map`));
});

app.get('/*.ico', (req, res) => {
    res.sendFile(path.join(__dirname, './public', `${req.params['0']}.ico`));
});

app.get('/disk/:object_fid/:file_id', (req, res) => {
    
});

app.get('/disk/wall_*/:file_id', (req, res) => {
    dbContext
    .getFileSteam(req.params['file_id'])
    .then((stream) => {
        stream.pipe(res)
    });
});

app.post('/disk/upload/:access_token', (req, res) => {

    let access_token = req.params.access_token;
    let tokenData = dbContext.getUploadTokenData(access_token);

    if (tokenData == AppTypes.DENIED) {
        res.status = 403;
        res.end('Access denied');
    }
    else if (tokenData == AppTypes.TIME_BANNED) {
        res.status = 403;
        res.end('Time banned');
    }
    else {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, file_name) {

            let ext = fileType(file)['ext'];

            let ext_true = dbContext.accessFileExt(ext);
            
            let file_id = `${securityHelper.generateFileId()}`;

            if (ext_true) {
                dbContext
                .uploadFile(file_id, file_name, tokenData['object_fid'], ext, file)
                .then((result) => {
                    res.status = 200;
                    res.send(result);
                })
                .catch((err) => {
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
