"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = require('./../config.json');
var request = require('request');
var SmsProvider = (function () {
    function SmsProvider() {
        var _this = this;
        this.smsApiUrl = 'https://smsc.ru/sys/send.php';
        this.sendSms = function (phone, smsCode) {
            return new Promise(function (resolve, reject) {
                request.post({
                    url: _this.smsApiUrl + "?login=" + config.sms.login + "&psw=" + config.sms.password + "&phones=" + phone.replace('+', '') + "&mes=" + Array.prototype.slice.call(String(smsCode)).join('+') + "&voice=m&call=1"
                }, function (err, full_res, body) {
                    console.log('Sms body response: ', body);
                    console.log('Sms error: ', err);
                    if (err)
                        reject(err);
                    else
                        resolve(body);
                });
            });
        };
    }
    return SmsProvider;
}());
exports.default = SmsProvider;
