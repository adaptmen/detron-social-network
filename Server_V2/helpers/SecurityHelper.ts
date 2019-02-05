const uniqid = require('uniqid');
const crypto = require('crypto');

export default class SecurityHelper {

  private get_r(length) {
    return crypto.randomBytes(length / 2).toString('hex')
  }

  public generateId() {
    return `${this.get_r(14)}-${this.get_r(10)}`;
  }

  public generateFileId() {
    return `${this.get_r(14)}`;
  }

  public generateLongId() {
    return `${this.get_r(14)}-${this.get_r(10)}-${this.get_r(20)}-${this.get_r(14)}-${this.get_r(10)}-${this.get_r(20)}`;
  }

  public generateToken() {
    return `${this.get_r(100)}`;
  }

  public generateAuthToken() {
    return `${this.get_r(14)}-${this.get_r(10)}`;
  }

  public generateSmsCode() {
    return Math.floor(Math.random() * 100000).toString();
  }

}

