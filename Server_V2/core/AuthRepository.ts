import DbContext from './DbContext';
import SecurityHelper from '../helpers/SecurityHelper';
import AppTypes from './AppTypes';


export default class AuthRepository {

	public dbContext;
	public securityHelper;

	constructor(dbContext: DbContext) {
		this.dbContext = dbContext;
		this.securityHelper = new SecurityHelper();
	}

	public token_store = {};

	public login(login, password) {
		return this.dbContext.login(login, password).then((res) => {
			if (res === AppTypes.DENIED) return AppTypes.DENIED;
			if (res === AppTypes.ACCESS) {
				return this.generateToken(login);
			}
		});
	}

	public generateToken(login) {
		let new_t = this.securityHelper.generateAuthToken();
		this.token_store[new_t] = { login, expire: Date.now() + 1000 * 60 * 60 * 24 * 2 };
		return new_t;
	}

	public destroyToken(token) {
		delete this.token_store[token];
	}

	public checkToken(token): AppTypes.NOT_EXIST | AppTypes.TIME_BANNED | AppTypes.SUCCESS {
		if (!this.token_store[token]) return AppTypes.NOT_EXIST;
		if (this.token_store[token].expire < Date.now()) return AppTypes.TIME_BANNED;
		return AppTypes.SUCCESS;
	}

	public getByToken(token) {
		return this.token_store[token];
	}

	public updateToken(token) {
		let last_info = this.token_store[token];
		let new_t = this.securityHelper.generateAuthToken();
		this.token_store[new_t] = last_info;
		delete this.token_store[token];
		return new_t;
	}

	public signup(login, password) {
		return this
		.dbContext
		.checkExist(login)
		.then((res) => {
			if (res === AppTypes.EXIST) return AppTypes.EXIST;
			if (res === AppTypes.NOT_EXIST) {
				return this
				.dbContext
				.createUser(login, password)
				.then((r) => { return this.generateToken(login) });
			}
		});
	}

}