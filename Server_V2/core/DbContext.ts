import SecurityHelper from '../helpers/SecurityHelper';
import SocketContext from "./SocketContext";
import MongoContext from "./MongoContext";
import FileDataProvider from '../providers/FileDataProvider';
import HistoryDataProvider from '../providers/HistoryDataProvider';
import MessageDataProvider from '../providers/MessageDataProvider';
import UserDataProvider from '../providers/UserDataProvider';
import WallDataProvider from '../providers/WallDataProvider';
import GroupDataProvider from '../providers/GroupDataProvider';

export default class DbContext {

	private messageProvider = new MessageDataProvider();
	private historyProvider = new HistoryDataProvider();
	private userProvider = new UserDataProvider();
	private wallProvider = new WallDataProvider();
	private fileProvider = new FileDataProvider();
	private groupProvider = new GroupDataProvider();

	private securityHelper = new SecurityHelper();
	private mongoContext: MongoContext;

	constructor(mongoContext: MongoContext) {
		this.mongoContext = mongoContext;
	}

	public login(login, password): any {
		return this
		.userProvider
		.checkAccess(login, password)
		.then((res) => {
             if (res === AppTypes.EMPTY) return AppTypes.DENIED;
             else return AppTypes.ACCESS;
         });
	}

	public checkExist(login) {
		return this.userProvider.checkExist(login).then((res) => {
			if (res === AppTypes.EMPTY) return AppTypes.NOT_EXIST;
            else return AppTypes.EXIST;
		});
	}

	public getUser(login) {
		return this.userProvider.getByLogin(login);
	}

	public createUser(login, password) {
		let new_u = {
			id: this.securityHelper.generateId(),
			login, password,
			token: this.securityHelper.generateToken(),
			f_token: this.securityHelper.generateToken()
		};
		this
		.userProvider
		.insertUser(new_u.id, new_u.login, new_u.password, new_u.token, new_u.f_token)
		.then((res) => {
			return AppTypes.SUCCESS;
		});
	}


}
