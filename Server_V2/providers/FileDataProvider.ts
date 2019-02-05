import DataProvider from "./DataProvider";
import AppTypes from '../core/AppTypes';


export default class FileDataProvider extends DataProvider {

    constructor() {
        super();
    }

    private TOKEN_LIVE_TIME = 60 * 1000;

    public token_store = {};

    public generateToken(user_id, object_fid) {
        let token = this.securityHelper.generateToken();
        this.token_store[token] = {
            user_id,
            object_fid,
            expire: Date.now() + 1000 * 60 * 5
        };
        return token;
    }

    public getTokenData(token) {
        if (!this.token_store[token]) return AppTypes.NOT_EXIST;
        if (this.token_store[token].expire < Date.now()) {
            delete this.token_store[token];
            return AppTypes.TIME_BANNED;
        }
        else return this.token_store[token];
    }

  // public addToken(token, uf_token, user_id) {
  //   console.log('Add ', token);
  //   this.access_tokens[token] = {
  //     time: Date.now () + this.TOKEN_LIVE_TIME,
  //     uf_token: uf_token,
  //     user_id: user_id
  //   };
  //   console.log("Tokens: ", this.access_tokens);
  // }

  // public checkToken(token) {
  //   if (this.access_tokens[token]) {
  //     if (this.access_tokens[token].time >= Date.now()) {
  //       let tokenInfo = Object.assign({}, this.access_tokens[token]);
  //       delete this.access_tokens[token];
  //       return tokenInfo;
  //     }
  //     else {
  //       delete this.access_tokens[token];
  //       return false;
  //     }
  //   }
  //   else {
  //     return false;
  //   }
  // }

  public addFile(file_id, attacher) {
    let sparql =
      `${this.sparqlHelper.prefixes}
        INSERT DATA { 
          GRAPH <${this.sparqlHelper.graphs_uri.files}>
            { files:file_${file_id} type:id "${file_id}";
              files:attacher ${attacher} ;
              files:privacy "public" } }`;
    return this.query(sparql, 'update');
  }

  public getFile(file_id) {
    let sparql =
      `${this.sparqlHelper.prefixes}
        SELECT ?mongo_id ?attacher
        FROM <${this.sparqlHelper.graphs_uri.files}>
        { files:file_${file_id} files:mongo_id ?mongo_id .
        }`;
    return this.query(sparql, 'query');
  }

  public getByOwner(owner) {
    let sparql =
      `${this.sparqlHelper.prefixes}
        SELECT ?file_id
        FROM <${this.sparqlHelper.graphs_uri.files}>
        { ?file files:attacher ${owner}; type:id ?file_id .
        }`;
    return this.query(sparql, 'query');
  }

}
