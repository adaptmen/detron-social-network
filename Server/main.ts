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
import AppRepository from './core/AppRepository';

import FileProvider from './providers/FileDataProvider';
import SmsProvider from './providers/SmsProvider';

var appRepository = new AppRepository();

var smsProvider = new SmsProvider();
var fileProvider = new FileProvider();

var securityHelper = new SecurityHelper();
var store = new Store({ path: 'phones.json' });
var PNF = GooglePhoneLib.PhoneNumberFormat;
var phoneUtil = GooglePhoneLib.PhoneNumberUtil.getInstance();

appRepository.takeSnapshot();

app.use(busboy());

var app = express();
var server = http.createServer(app);
var io: socketIo.Server = socketIo(server);
server.listen(config.server.port);

var mongoContext: MongoContext = new MongoContext();
var dbContext: DbContext = new DbContext(mongoContext, appRepository);
var socketContext: SocketContext = new SocketContext(io, appRepository, dbContext, mongoContext);

const truePhone = (phoneNum) => {
    return phoneUtil.format(phoneUtil.parse(phoneNum.toString(), 'RU'), PNF.E164);
};

const checkExistPhone = (phone) => {
    return appRepository.checkInAuth(phone);
};

const checkInStore = (phone) => {
    return !!store.get(String(phone));
};


appRepository.onInit = () => {

    app.all('/auth/number', (req, res) => {

        let phone = truePhone(req.query.phone);
        let smsCode = securityHelper.generateSmsCode();

        if (checkInStore(phone)) {
            let countTrue = (Number(store.get(`${phone}.count`)) > 0);
            let timeTrue = (Number(store.get(`${phone}.allow_date`)) <= Date.now());

            if (countTrue && timeTrue) {
                store.set(`${phone}.count`, String(Number(store.get(`${phone}.count`)) - 1));
                store.set(`${phone}.code`, String(smsCode));

                smsProvider
                    .sendSms(phone, smsCode)
                    .then((body: any) => {
                        if (body.match('OK')) {
                            res.send({ code: 'count', answer: { count: Number(store.get(`${phone}.count`)) } });
                        }
                        else {
                            res.send({ code: 'code', answer: 'error' });
                        }
                    });
            }

            else if (countTrue && !timeTrue) {
                res.send({ code: 'date', answer: { date: Number(store.get(`${phone}.allow_date`)) - Date.now() } });
            }

            else if (!countTrue && timeTrue) {
                let allow_date = Date.now() + 1000 * 60 * 60 * 24;
                store.set(`${phone}.allow_date`, String(allow_date));
                store.set(`${phone}.count`, 3);
                res.send({ code: 'date', answer: { date: Number(store.get(`${phone}.allow_date`)) - Date.now() } });
            }

            else {
                res.send({ code: 'date', answer: { date: Number(store.get(`${phone}.allow_date`)) - Date.now() } });
            }

        }

        else {
            store.set(String(phone + '.code'), smsCode);
            store.set(String(phone + '.count'), String(3));
            store.set(String(phone + '.allow_date'), String(Date.now()));

            smsProvider
                .sendSms(phone, smsCode)
                .then((body: any) => {
                    if (body.match('OK')) {
                        res.send({ code: "first", answer: { status: 'allow' } });
                    }
                    else {
                        res.send({ answer: 'error' });
                    }
                })
                .catch((err) => {
                    console.log(err)
                });
        }

    });

    app.all('/auth/code', (req, res) => {
        let params = req.query;
        console.log(params);
        params.phone = truePhone(params.phone);

        if (!checkInStore(params.phone)) {
            res.send({ code: "first", answer: { status: 'allow' } });
            return 0;
        }

        let countTrue = (Number(store.get(`${params.phone}.count`)) > 0);                 // <-- Кол-во попыток
        let codeTrue = (params.code == store.get(`${params.phone}.code`));               // <-- Правильный код подтверждения
        let timeTrue = (Number(store.get(`${params.phone}.allow_date`)) <= Date.now());  // <-- Позволительное время

        if (countTrue && codeTrue && timeTrue) {
            let token = securityHelper.generateToken();
            let ftoken = securityHelper.generateLongId();

            if (dbContext.checkByPhone(params.phone)) {
                console.log('Main: user existed');
                let authUser = appRepository.authList[params.phone];
                res.send({ code: "cred", answer: { phone: params.phone, token: authUser.token } });
            }
            else {
                dbContext
                    .createUser(params.phone, token, ftoken)
                    .then((result) => {
                        if (result == "user created") {
                            res.send({ code: "cred", answer: { phone: params.phone, token: token } });
                        }
                    }).catch((error) => { console.log(error) });
            }
        }
        else if (countTrue && !codeTrue && timeTrue) {
            store.set(`${params.phone}.count`, String(Number(store.get(`${params.phone}.count`)) - 1));
            res.send({ code: "count", answer: { count: Number(store.get(`${params.phone}.count`)) } });
        }
        else if ((!countTrue && codeTrue && timeTrue) || (!countTrue && !codeTrue && timeTrue)) {
            let allow_date = Date.now() + 1000 * 60 * 60 * 24;
            store.set(`${params.phone}.allow_date`, String(allow_date));
            store.set(`${params.phone}.count`, 3);
            res.send({ code: 'date', answer: { date: Number(store.get(`${params.phone}.allow_date`)) - Date.now() } });
        }
        else if (countTrue && !timeTrue) {
            res.send({ code: 'date', answer: { date: Number(store.get(`${params.phone}.allow_date`)) - Date.now() } });
        }

    });

    app.get('/file/:fid', (req, res) => {
        let f_id = req.params.fid;
        //let uf_id = req.params.ufid;

        fileProvider.getFile(f_id).then((file_info) => {
            console.log("File info: ", file_info);
            let m_stream = mongoContext.readStream(file_info[0].mongo_id);
            m_stream.pipe(res);
        });
    });

    app.post('/upload/:f_token', (req, res) => {

        let f_token = req.params.f_token;

        console.log('Access token: ', f_token);

        let access_info = fileProvider.checkToken(f_token);

        if (access_info) {
            req.pipe(req.busboy);
            req.busboy.on('file', function (fieldname, file, f_name) {

                let filename = `${securityHelper.generateFileId()}`;

                let m_stream = mongoContext.writeStream(filename, {});
                console.log("Uploading: " + filename);

                file.pipe(m_stream);

                m_stream.on('finish', function () {
                    console.log("Upload finished of " + filename);
                    fileProvider.addFile(filename, access_info.user_id, access_info.privacy, m_stream.id)
                        .then((info) => {
                            res.send({ code: "upload", answer: { file_id: filename } });
                        });
                });

            });
        }
        else {
            res.send({ code: "upload", answer: { message: "token error" } });
        }

    });

    app.all('/login', (req, res) => {
        let params = req.query;
        params.phone = truePhone(params.phone);
        dbContext.loginUser(params.phone, params.token) == 'allow'
            ? res.send({ code: "login", answer: 'allow' })
            : res.send({ code: "login", answer: 'not allow' });
    });

    process.on('uncaughtException', function (err) {
        console.log(err);
    });

};
