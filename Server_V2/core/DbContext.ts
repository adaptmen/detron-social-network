import SecurityHelper from '../helpers/SecurityHelper';
import SocketContext from "./SocketContext";
import MongoContext from "./MongoContext";
import SqlContext from "./SqlContext";
import FileDataProvider from '../providers/FileDataProvider';
import HistoryDataProvider from '../providers/HistoryDataProvider';
import MessageDataProvider from '../providers/MessageDataProvider';
import UserDataProvider from '../providers/UserDataProvider';
import WallDataProvider from '../providers/WallDataProvider';
import GroupDataProvider from '../providers/GroupDataProvider';

import AppTypes from './AppTypes';

export default class DbContext {

	private securityHelper = new SecurityHelper();
	private mongoContext: MongoContext;
	private sqlContext: SqlContext;

	private messageProvider: MessageDataProvider;
	private historyProvider: HistoryDataProvider;
	private userProvider: UserDataProvider;
	private wallProvider: WallDataProvider;
	private fileProvider: FileDataProvider;
	private groupProvider: GroupDataProvider;
	
	constructor(mongoContext: MongoContext, sqlContext: SqlContext) {
		this.mongoContext = mongoContext;
		this.sqlContext = sqlContext;
		this.messageProvider = new MessageDataProvider(this.sqlContext);
		this.historyProvider = new HistoryDataProvider(this.sqlContext);
		this.userProvider = new UserDataProvider(this.sqlContext);
		this.wallProvider = new WallDataProvider(this.sqlContext);
		this.fileProvider = new FileDataProvider();
		this.groupProvider = new GroupDataProvider();
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

	public getUserInit(login) {
		return new Promise((resolve, reject) => {
			this
			.userProvider
			.getUserInit(login)
			.then((user: any) => {
				this
				.getChats(user.id)
				.then((chats) => {
					resolve({ user, chats })
				})
			})
		})
	}

	public getChats(user_id) {
		return new Promise((resolve, reject) => {
			this
			.messageProvider
			.getChats(user_id)
			.then((chats) => {
				if (chats.length == 0) return resolve([]);
				let ids = [];
				chats.forEach((chat) => {
					ids.push(chat.friend_id);
				});
				this.sqlContext
				.query(`USE app SELECT id, name, avatar_url
				 FROM \`users\` WHERE id IN ("${ids.join('\', \'')}")`)
				.then((friends: any) => {
					chats.forEach((chat) => {
						friends.forEach((friend) => {
							if (chat.friend_id == friend.id) {
								chat['name'] = friend.name;
								chat['user_id'] = friend.id;
								chat['avatar_url'] = friend.avatar_url;
							}
						});
					});
					resolve(chats);
				});
			});
		});
	}

	public parseObjectFid(object_fid, regex) {
		return String(object_fid).match(regex);
	}

	public checkUploadAccess(user_id, object_fid): Promise <AppTypes.SUCCESS | AppTypes.ERROR> {
		let wall_parse = this.parseObjectFid(object_fid, /(wall)_([^.]+)/);
		let chat_parse = this.parseObjectFid(object_fid, /(chat)_([^.]+)/);
		let user_parse = this.parseObjectFid(object_fid, /(user)_([^.]+)/);
		return new Promise((resolve, reject) => {
			if(!wall_parse && !chat_parse && !user_parse) return reject(AppTypes.ERROR);
			console.log(user_id, object_fid);
			if (wall_parse) {
				this
				.wallProvider
				.getOwnerInfo(wall_parse[2])
				.then((res) => {
					return res[0].id == user_id 
					? resolve(AppTypes.SUCCESS)
					: resolve(AppTypes.ERROR)
				});
			}
			if (chat_parse) {
				this
				.userProvider
				.checkSubscribe(user_id, object_fid)
				.then((res) => {
					return res === AppTypes.SUCCESS 
					? resolve(AppTypes.SUCCESS)
					: resolve(AppTypes.ERROR);
				});
			}
			if (user_parse) {
				`user_${user_id}` == object_fid 
				? resolve(AppTypes.SUCCESS)
				: resolve(AppTypes.ERROR)
			}
		});
	}

	public generateUploadToken(user_id, object_fid) {
		return this.fileProvider.generateToken(user_id, object_fid);
	}

	public getUploadTokenData(token) {
		let tData = this.fileProvider.getTokenData(token);
		if (tData == AppTypes.TIME_BANNED) return AppTypes.TIME_BANNED;
		if (tData == AppTypes.NOT_EXIST) return AppTypes.DENIED;
		return tData;
	}

	public getFileStream(file_id) {
		return this
		.sqlContext.db('disk')
		.query(`SELECT mongo_id FROM ?? WHERE id = ?`, 
			['files', file_id])
		.then((res: any) => {
			return this.mongoContext.readStream(res.mongo_id)
		});
	}

	public accessFileExt(ext) {
		let ACCESS_LIST = ['.png', '.jpeg', '.jpg', '.pdf'];
		return ACCESS_LIST.includes(ext);
	}

	public checkFileAccess(user_id, object) {
		let wall_parse = String(object).match(/(wall)_([^.]+)/);
		let chat_parse = String(object).match(/(chat)_([^.]+)/);
		let user_parse = String(object).match(/(user)_([^.]+)/);

		return new Promise((resolve, reject) => {
			if(!wall_parse && !chat_parse && !user_parse) return reject(AppTypes.ERROR);
			if (wall_parse) {
				this
				.userProvider
				.checkSubscribe(user_id, object)
				.then((res) => {
					return res === AppTypes.SUCCESS 
					? resolve(AppTypes.SUCCESS) 
					: this
					.wallProvider
					.checkOwner(wall_parse[2], user_id)
					.then((res) => {
						return res === AppTypes.SUCCESS 
						? resolve(AppTypes.SUCCESS)
						: resolve(AppTypes.ERROR)
					});
				});
			}
			if (chat_parse) {
				this
				.userProvider
				.checkSubscribe(user_id, object)
				.then((res) => {
					return res === AppTypes.SUCCESS 
					? resolve(AppTypes.SUCCESS)
					: resolve(AppTypes.ERROR);
				});
			}
			if (user_parse) {
				`user_${user_id}` == object 
				? resolve(AppTypes.SUCCESS)
				: resolve(AppTypes.ERROR)
			}
		});
	}

	public uploadFile(file_id, file_name, attacher, ext, file) {
		return new Promise((resolve, reject) => {
			let m_stream = this.mongoContext.writeStream(file_id, {});
            file.pipe(m_stream);
            m_stream.on('finish', () => {
            	let f_attacher = '';
            	let wall_parse = String(attacher).match(/(wall)_([^.]+)/);
				let chat_parse = String(attacher).match(/(chat)_([^.]+)/);
				let user_parse = String(attacher).match(/(user)_([^.]+)/);
				if (wall_parse) f_attacher = `walls:${attacher}`;
				if (chat_parse) f_attacher = `chats:${attacher}`;
				if (user_parse) f_attacher = `users:${attacher}`;
                this.fileProvider.addFile(file_id, f_attacher)
                    .then((info) => {
                    	this.sqlContext.db('disk')
                    	.query(`INSERT INTO ??
                    	 (id, name, privacy, ext, mongo_id)
                    	 VALUES (?, ?, ?, ?, ?)`,
                    	 ['files', file_id, file_name, 'public', ext, m_stream.id.toString()])
                    	.then(() => {
                        	resolve(`/disk/${attacher}/${file_id}`);
                    	});
                    });
            });
		});
	}

	public getFileList(attacher) {
		return new Promise((resolve, reject) => {
			this
			.fileProvider
			.getByOwner(attacher)
			.then((res) => {
				if (res.length == 0) return resolve([]);
				let files_ids = [];
				res.forEach((g_file: any) => {
					files_ids.push(g_file['file_id']);
				});
				this
				.sqlContext
				.db('disk')
				.query(`SELECT ??, ??, ?? FROM ?? WHERE id IN (?)`, 
					['id', 'name', 'ext', 'files', files_ids])
				.then((s_files: any) => {
					if (s_files.name) return resolve([s_files]);
					else resolve(s_files);
				});
			});
		});
	}

	public createUser(login, password) {
		let new_u = {
			id: this.securityHelper.generateId(),
			login, password,
			token: this.securityHelper.generateToken(),
			f_token: this.securityHelper.generateToken()
		};
		return new Promise((resolve, reject) => {
			return this
			.userProvider
			.insertUser(new_u.id, new_u.login, new_u.password, new_u.token, new_u.f_token)
			.then((res) => {
				let wall_id = this.securityHelper.generateId();
				this
				.wallProvider
				.addWall(wall_id, `users:user_${new_u.id}`)
				.then(() => {
					this.sqlContext.db('app')
					.query(`UPDATE ?? SET ?? = ? WHERE ?? = ?`,
					 ['users', 'wall_id', wall_id, 'id', new_u.id])
					.then(() => {
						resolve(AppTypes.SUCCESS);
					})
				})
			})
		});
	}

	public createChat(user_1_id, user_2_id) {
		let chat_id = this.securityHelper.generateId();
		return new Promise((resolve, reject) => {
			this
			.messageProvider
			.createChat(chat_id, user_1_id, user_2_id)
			.then((res) => {
				this.userProvider.subscribeUser(user_1_id, `chats:chat_${chat_id}`).then((res) => {
					this.userProvider.subscribeUser(user_2_id, `chats:chat_${chat_id}`).then((res) => {
						resolve(chat_id);
					})
				})
			})
		});
	}

	public sendMessage(chat_id, maker_id, content) {
		let time = Date.now();
		return new Promise((resolve, reject) => {
			this
			.messageProvider
			.addMessage(chat_id, maker_id, content, time).then((res) => {
				this
				.historyProvider
				.addEvent('new_message', `user_${maker_id}`, `chat_${chat_id}`, time)
				.then(() => {
					resolve()
				})
			})
		})
	}

	public getPage(page_id) {
		return new Promise((resolve, reject) => {
			this
			.userProvider
			.checkExistById(page_id)
			.then((answer: any) => {
				if (answer == AppTypes.EMPTY) resolve(AppTypes.NOT_EXIST);
				else {
					let page = {wall: {}};
					this
					.userProvider
					.getPageUserById(answer.id)
					.then((ans: any) => {
						Object.assign(page, ans);
						this
						.wallProvider
						.getPostsForWall(ans.wall_id, 0)
						.then((posts) => {
							page.wall['posts'] = posts;
							page.wall['id'] = ans.wall_id;
							this
							.getFileList(`walls:wall_${page.wall['id']}`)
							.then((file_list) => {
								page.wall['files'] = file_list;
								resolve(page);
							});
						});
					});
				}
			});
		});
	}

	public getMessages(user_id, chat_id, offsetLevel) {
		return new Promise((resolve, reject) => {
			this
			.userProvider
			.checkSubscribe(user_id, `chats:${chat_id}`)
			.then((res) => {
				if (res === AppTypes.SUCCESS) {
					this
					.messageProvider
					.getMessagesByChat(chat_id, offsetLevel)
					.then((messages) => {
						let users_ids = [];
						messages.forEach((message) => {
							users_ids.push(message['maker_id'])
						});
						this.userProvider.getPersonsById(users_ids).then((persons: any) => {
							persons.forEach((person) => {
								messages.forEach((message) => {
									if (message['maker_id'] == person['id']) {
										message['maker_name'] = person['name'];
										message['avatar_url'] = person['avatar_url'];
									}
								});
							});
							resolve(messages);
						});
					});
				}
				else {
					return AppTypes.ERROR;
				}
			});
		});
	}

}
