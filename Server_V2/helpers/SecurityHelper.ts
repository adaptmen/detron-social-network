const uniqid = require('uniqid');

export default class SecurityHelper {

  public generateId() {
    return `${uniqid.process()}-${uniqid.time()}-${uniqid.process()}-${uniqid.time()}-${uniqid.process()}`;
  }

  public generateFileId() {
    return `${uniqid.process(uniqid.time())}-${uniqid.time(uniqid.time())}-${uniqid.process(uniqid.time())}`;
  }

  public generateLongId() {
    return `${uniqid.process()}${uniqid.time()}${uniqid.process()}${uniqid.time()}${uniqid.process()}${uniqid.process()}${uniqid.time()}${uniqid.process()}${uniqid.time()}${uniqid.process()}${uniqid.process()}${uniqid.time()}${uniqid.process()}${uniqid.time()}${uniqid.process()}${uniqid.process()}${uniqid.time()}${uniqid.process()}${uniqid.time()}${uniqid.process()}`;
  }

  public generateToken() {
    return `${ uniqid( uniqid( uniqid( uniqid( uniqid( uniqid() ) ) ) ) ) }`;
  }

  public generateSmsCode() {
    return Math.floor(Math.random() * 100000).toString();
  }

}

