const config = require('./../config.json');
const request = require('request');

export default class SmsProvider {

  private smsApiUrl = 'https://smsc.ru/sys/send.php';

  public sendSms = (phone, smsCode) => {

    return new Promise((resolve, reject) => {
      request.post({
        url: `${this.smsApiUrl}?login=${config.sms.login}&psw=${config.sms.password}&phones=${phone.replace('+', '')}&mes=${Array.prototype.slice.call(String(smsCode)).join('+')}&voice=m&call=1`
      }, (err, full_res, body) => {
          console.log('Sms body response: ', body);
          console.log('Sms error: ', err);
          if (err)
            reject(err)
          else
            resolve(body)
      })
    })

  }

}
