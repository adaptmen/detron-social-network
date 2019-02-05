import DataProvider from "./DataProvider";
import AppTypes from '../core/AppTypes';


export default class FileDataProvider extends DataProvider {

	constructor() {
			super();
	}

	private TOKEN_LIVE_TIME = 60 * 1000;

	public token_store = {};
	public attach_token_store = {};

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


	public generateAttachToken(object_fid, file_id) {
		let token = this.securityHelper.generateToken();
        this.attach_token_store[token] = {
            file_id,
            object_fid,
            expire: Date.now() + 1000 * 60 * 5
        };
        return token;
	}

	public getAttachTokenData(token) {
			if (!this.attach_token_store[token]) return AppTypes.NOT_EXIST;
			if (this.attach_token_store[token].expire < Date.now()) {
				delete this.attach_token_store[token];
				return AppTypes.TIME_BANNED;
			}
			else return this.attach_token_store[token];
	}

	public attachFile(file_id, attacher) {
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
