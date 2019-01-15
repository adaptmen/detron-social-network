import DataProvider from "./DataProvider";


export default class FileDataProvider extends DataProvider {

  constructor() {
    super();
  }

  private TOKEN_LIVE_TIME = 60 * 1000;

  public access_tokens = {};

  public addToken(token, uf_token, user_id, privacy) {
    console.log('Add ', token);
    this.access_tokens[token] = {
      time: Date.now () + this.TOKEN_LIVE_TIME,
      uf_token: uf_token,
      user_id: user_id,
      privacy: privacy
    };
    console.log("Tokens: ", this.access_tokens);
  }

  public checkToken(token) {
    console.log("Token in check: ", token);
    console.log("All tokens: ", this.access_tokens);
    if (this.access_tokens[token]) {
      console.log(this.access_tokens[token].time >= Date.now());
      if (this.access_tokens[token].time >= Date.now()) {
        let tokenInfo = Object.assign({}, this.access_tokens[token]);
        delete this.access_tokens[token];
        console.log(tokenInfo);
        return tokenInfo;
      }
      else {
        delete this.access_tokens[token];
        return false;
      }
    }
    else {
      return false;
    }
  }

  public addFile(file_id, owner_id, privacy, mongo_id) {
    let sparql =
      `${this.sparqlHelper.prefixes}
        INSERT DATA { 
          GRAPH <${this.base_url}/${this.dataset}>
            { files:file_${file_id} type:id "${file_id}";
              files:owner users:user_${owner_id} ;
              files:privacy "${privacy}" ;
              files:mongo_id "${mongo_id}" } }`;
    return this.query(sparql, 'update');
  }

  public getFile(file_id) {
    let sparql =
      `${this.sparqlHelper.prefixes}
        SELECT ?mongo_id ?privacy ?owner_id
        FROM <${this.base_url}/${this.dataset}> 
        { files:file_${file_id} files:owner ?owner .
          ?owner type:id ?owner_id .
          files:file_${file_id} files:privacy ?privacy ;
          files:mongo_id ?mongo_id .
        }`;
    return this.query(sparql, 'query');
  }

}
