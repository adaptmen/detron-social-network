import fs = require('fs');
import Store = require('data-store');
import GooglePhoneLib = require('google-libphonenumber');
import http = require('http');
var config = require('./config.json');
import express = require('express');
import busboy = require('connect-busboy');
import * as socketIo from 'socket.io';

import SocketContext from './core/SocketContext';
import DbContext from './core/DbContext';
import MongoContext from './core/MongoContext';
import SecurityHelper from './helpers/SecurityHelper';
import AppTypes from './core/AppTypes';

import AuthRepository from './core/AuthRepository';
import SmsProvider from './providers/SmsProvider';

var smsProvider = new SmsProvider();

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
var dbContext: DbContext = new DbContext(mongoContext);
var authRepository = new AuthRepository(dbContext);
var socketContext: SocketContext = new SocketContext(io, dbContext, authRepository);

const truePhone = (phoneNum) => {
    return phoneUtil.format(phoneUtil.parse(phoneNum.toString(), 'RU'), PNF.E164);
};

const checkInStore = (phone) => {
    return !!store.get(String(phone));
};

app.get('/auth/login', (req, res) => {
    authRepository
    .login(req.url.params.login, req.url.params.password)
    .then((result) => {
        if (result === AppTypes.DENIED) {
            res.status = 403;
            res.end('Access denied');
        }
        else if (typeof(result) === 'string') {
            res.status = 200;
            res.cookie.set('t', result);
            res.end(result);
        }
    });
});

app.get('/auth/signup', (req, res) => {
    authRepository
    .signup(req.url.params.login, req.url.params.password)
    .then((result) => {
        if (result === AppTypes.EXIST) {
            res.status = 403;
            res.end("User exist");
        }
        else if (typeof(result) === 'string') {
            res.status = 200;
            res.cookie.set('t', result);
            res.end("Signup success");
        }
    });
});

app.get('/app', (req, res) => {
    if (req.cookie.t) {
        let status = authRepository.checkToken(req.cookie.t);
        if (status === AppTypes.NOT_EXIST) {
            res.status = 403;
            res.end("Token failed");
        }
        else if (status === AppTypes.TIME_BANNED) {
            res.status = 403;
            res.end("Time banned");
        }
        else if (status === AppTypes.SUCCESS) {
            res.status = 200;
            res.sendFile(path.join(__dirname, '../public', 'index.html'));
            res.cookie.set("t", authRepository.updateToken(req.cookie.t));
        }
    }
});

process.on('uncaughtException', function (err) {
    console.log(err);
});
