import DbContext from './DbContext';
import SecurityHelper from '../helpers/SecurityHelper';


export default class AuthRepository {

	private MAX_TRY_COUNT = 2;

	public dbContext;
	public securityHelper;

	constructor(dbContext: DbContext) {
		this.dbContext = dbContext;
		this.securityHelper = new SecurityHelper();
	}

	public auth_store = new AuthStore();
	public token_store = {};//new TokenStore();

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

class AuthStore {
	public MAX_TRY_COUNT = 3;
	public store = {};
	public checkExist = (phone) => !!this.store[phone];
	public addInstance = (phone, token) => {
		if (!this.checkExist(phone)) {
			this.store[phone] = {
				last_auth: Date.now(),
				last_try_time: 0,
				try_count: 0,
				allow_date: 0,
				token: token
			};
		}
	};
	public checkBanned = (phone) => !!(this.store[phone].allow_date > Date.now());
	public ban = (phone) => {
		this.store[phone].allow_date = Date.now() + 1 * 24 * 60 * 60 * 1000;
		this.store[phone].try_count = 0;
	};
	public addTry = (phone) => {
		if (this.checkBanned(phone)) {
			return {
				type: AppTypes.TIME_BANNED,
				data: this.store[phone].allow_date
			}
		}
		if (this.store[phone].try_count + 1 > this.MAX_TRY_COUNT) {
			this.store[phone].allow_date = Date.now() + 1 * 24 * 60 * 60 * 1000;
			this.store[phone].try_count = 0;
			return {
				type: AppTypes.TIME_BANNED,
				data: this.store[phone].allow_date
			}
		}
		else {

		}
	}
}

class TokenStore {
	public store = {};

	public checkExpires = (token) => this.store[token].expires > Date.now();

	public generateToken(token_type: TokenTypes, data) {
		let new_t = new AuthToken(token_type);
		this.store[new_t.token] = new_t;
		return new_t;
	}

	public bindTokenData(token: string, data: any) {
		this.store[token].data = Object.assign(this.store[token].data, data);
	}

	public destroyToken(token: string) {
		delete this.store[token];
	}

}

class AuthToken {
	public token: string;
	public action_type: TokenTypes;
	public expires: number;
	public data: any;
	private securityHelper = new SecurityHelper(); 
	constructor(action_type: TokenTypes) {
		this.token = this.securityHelper.generateToken();
		this.action_type = action_type;
		this.expires = Date.now() + 1000 * 60 * 60 * 24 * 3
	}
}

enum TokenTypes {
	AUTH_PHONE = 'auth_phone',
	AUTH_CODE = 'auth_code',
	FORGOT_PHONE = 'forgot_phone',
	FORGOT_CODE = 'forgot_code',
	APP_ACCESS = 'app_access'
}

enum AppTypes {
	TIME_BANNED = 'time_banned',
	SUCCESS = 'success',
	ERROR = 'error',
}