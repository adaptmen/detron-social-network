import SecurityHelper from '../helpers/SecurityHelper';
import SocketContext from "./SocketContext";
import MongoContext from "./MongoContext";
import AppRepository from './AppRepository';
import FileDataProvider from '../providers/FileDataProvider';
import ChatDataProvider from '../providers/ChatDataProvider';
import HistoryDataProvider from '../providers/HistoryDataProvider';
import MessageDataProvider from '../providers/MessageDataProvider';
import UserDataProvider from '../providers/UserDataProvider';
import WallDataProvider from '../providers/WallDataProvider';
import GroupDataProvider from '../providers/GroupDataProvider';
import Group from '../models/Group';
import Wall from '../models/Wall';
import Post from '../models/Post';
import PostDataProvider from '../providers/PostDataProvider';
import HistoryEvent from '../models/HistoryEvent';
import HistoryEventTypes from './HistoryEventTypes';
import Message from '../models/Message';
import RequestTypes from './RequestTypes';
import Chat from '../models/Chat';

export default class DbContext {

	private messageProvider = new MessageDataProvider();
	private historyProvider = new HistoryDataProvider();
	private userProvider = new UserDataProvider();
	private chatProvider = new ChatDataProvider();
	private wallProvider = new WallDataProvider();
	private fileProvider = new FileDataProvider();
	private groupProvider = new GroupDataProvider();
	private postProvider = new PostDataProvider();

	private securityHelper = new SecurityHelper();
	private mongoContext: MongoContext;

	public appRepository: AppRepository;

	constructor(mongoContext: MongoContext, appRepository: AppRepository) {
		this.mongoContext = mongoContext;
		this.appRepository = appRepository;
	}

	public createUser(phone, token, ftoken): any {
		return new Promise((resolve, reject) => {
			let newId = this.securityHelper.generateId();
			this.userProvider.insertUser(newId, phone, token, ftoken)
				.then((result) => {
					this.appRepository.createUser({
						id: newId,
						phone: phone,
						name: phone,
						token: token
					});
					this.wallProvider.addWall(new Wall(newId)).then(() => {
						resolve("user created");
					});
				});
		})
	}

	public loginUser(phone, token): any {
		return this.appRepository.checkUser(phone, token)
			? "allow"
			: "not allow";
	}

	public checkByPhone(phone) {
		return this.appRepository.checkInAuth(phone)
	}

	public createMessage(message: Message) {
		return new Promise((resolve, reject) => {
			this
				.mongoContext
				.insertOne('messages', {
					id: message.id,
					content: message.content
				})
				.then((info) => {
					delete message.content;
					message.mongo_id = info['insertedId'];
					this
						.messageProvider
						.addMessage(message)
						.then(() => {
							let chat_event = new HistoryEvent(
								message.chat_id,
								message.id,
								HistoryEventTypes.NEW_MESSAGE,
								message.time);

							let user_event = new HistoryEvent(
								message.maker_id,
								chat_event.id,
								HistoryEventTypes.HISTORY_EVENT,
								message.time);

							this.appRepository.historyCache.addEvent(chat_event);
							this.appRepository.historyCache.addEvent(user_event);

							resolve();
						});
				});
		});
	}

	public createGroup(group: Group, wall: Wall): Promise<any> {
		return new Promise((resolve, reject) => {
			this
				.wallProvider
				.addWall(wall)
				.then(() => {
					this
						.groupProvider
						.addGroup(group)
						.then(() => { resolve() },
							(err) => { reject(err) });
				});
		});
	}

	public createPost(post: Post) {
		return new Promise((resolve, reject) => {
			this
				.mongoContext
				.insertOne('posts', { id: post.id, content: post.content })
				.then((info: any) => {
					post.mongo_id = info.insertedId;
					this
						.postProvider
						.addPost(post)
						.then(() => {
							let wall_event = new HistoryEvent(
								`walls:wall_${post.wall_id}`,
								`posts:post_${post.id}`,
								HistoryEventTypes.NEW_POST,
								post.time
							);
							let owner_event = new HistoryEvent(
								post.owner,
								wall_event.id,
								HistoryEventTypes.HISTORY_EVENT,
								post.time
							);
							this
								.historyProvider
								.addEvent(wall_event)
								.then(() => {
									this
										.historyProvider
										.addEvent(owner_event)
										.then(() => {
											resolve();
										});
								});
						});
				});
		});
	}

	public openChat(user_id, companion_id) {
		return new Promise((resolve, reject) => {
			this.chatProvider.checkChat(user_id, companion_id).then((exist) => {
				if (!exist) {
					let new_chat = new Chat(user_id, companion_id);
					this
						.chatProvider
						.addChat(new_chat.id)
						.then(() => {
							this
								.userProvider
								.subscribeUser(
									user_id,
									`chats:chat_${new_chat.id}`)
								.then(() => {
									this
										.userProvider
										.subscribeUser(
											companion_id,
											`chats:chat_${new_chat.id}`)
										.then(() => {
											resolve(new_chat.id);
										});
								});
						});
				}
				else {
					this
						.chatProvider
						.getChatId(user_id, companion_id)
						.then((chats) => {
							resolve(chats[0].chat_id);
						});
				}
			});
		});
	}

	public getWall(wall_id, offsetLevel, user_id) {
		return new Promise((resolve, reject) => {
			this
				.postProvider
				.getPostsForWall(wall_id, offsetLevel)
				.then((posts) => {
					for (let i = 0; i < posts.length; i++) {
						posts[i].owner_id = posts[i].owner_role + posts[i].owner_id;
						delete posts[i].owner_role;
						this
							.mongoContext
							.findOne('posts', {
								'_id': this.mongoContext.MongoId(posts[i]['mongo_id'])
							})
							.then((m_post: any) => {
								delete posts[i]['mongo_id'];
								posts[i].content = m_post.content;
								if (!this.appRepository.watchCache.checkWatch(user_id, `posts:post_${posts[i].id}`)) {
									this
										.postProvider
										.watchPost(user_id, posts[i].id)
										.then(() => {
											let post_watch_event = new HistoryEvent(
												`users:user_${user_id}`,
												`posts:post_${posts[i].id}`,
												HistoryEventTypes.WATCH,
												Date.now()
											);
											this
												.historyProvider
												.addEvent(post_watch_event)
												.then(() => {
													this
														.appRepository
														.historyCache
														.addEvent(post_watch_event);

													this
														.appRepository
														.watchCache
														.addWatch(
															user_id,
															`posts:post_${posts[i].id}`,
															post_watch_event.time
														)
												});
										});
								}
							});
						if (i == posts.length - 1) {
							this
								.wallProvider
								.getOwnerInfo(wall_id)
								.then((owner_info) => {
									resolve({
										owner_info,
										posts: posts
									});
								})
						}
					}

					let watch_event = new HistoryEvent(
						`users:user_${user_id}`,
						`walls:wall_${wall_id}`,
						HistoryEventTypes.WATCH,
						Date.now()
					)

					this
						.historyProvider
						.addEvent(watch_event)
						.then(() => {
							this
								.appRepository
								.historyCache
								.addEvent(watch_event);
						});
				})
		});
	}

	public getNews(user_id) {
		return new Promise((resolve, reject) => {
			this
				.userProvider
				.getNews(
					user_id,
					this
						.appRepository
						.usersCache
						.getUser(user_id)['offsetLevelNews']
				)
				.then((posts) => {
					for (let i = 0; i < posts.length; i++) {
						this
							.mongoContext
							.findOne('posts', {
								'_id': this.mongoContext.MongoId(posts[i]['mongo_id'])
							})
							.then((m_post: any) => {
								delete posts[i]['mongo_id'];
								posts[i].content = m_post.content;
								if (!this.appRepository.watchCache.checkWatch(user_id, `posts:post_${posts[i].id}`)) {
									this
										.postProvider
										.watchPost(user_id, posts[i].id)
										.then(() => {
											let post_watch_event = new HistoryEvent(
												`users:user_${user_id}`,
												`posts:post_${posts[i].id}`,
												HistoryEventTypes.WATCH,
												Date.now()
											);
											this
												.historyProvider
												.addEvent(post_watch_event)
												.then(() => {
													this
														.appRepository
														.historyCache
														.addEvent(post_watch_event);

													this
														.appRepository
														.watchCache
														.addWatch(
															user_id,
															`posts:post_${posts[i].id}`,
															post_watch_event.time
														)
												});
										});
								}
							});
						if (i == posts.length - 1) {
							let news_watch_event = new HistoryEvent(
								`users:user_${user_id}`,
								`news:user_${user_id}`,
								HistoryEventTypes.WATCH,
								Date.now()
							);
							this
								.historyProvider
								.addEvent(news_watch_event).then(() => {
									this
										.appRepository
										.historyCache
										.addEvent(news_watch_event);

									resolve(posts);
								});
						}
					}
				});
		});
	}

	public getMessage(message_id, chat_id) {
		return new Promise((resolve, reject) => {
			this
				.messageProvider
				.getMessageById(message_id, chat_id)
				.then((message: any) => {
					this
						.mongoContext
						.findOne(
							'messages',
							{
								'_id': this.mongoContext.MongoId(message.mongo_id)
							})
						.then((m_message: any) => {
							delete message.mongo_id;
							message.content = m_message.content;
							resolve(message);
						});
				});
		});
	}

	public getMessages(chat_id, user_id) {
		return new Promise((resolve, reject) => {
			let result_messages = [];
			let offsetLevel = this
				.appRepository
				.usersCache
				.getUser(user_id)['offsetLevelMessage'];
		this
			.messageProvider
			.getMessagesByChat(chat_id, offsetLevel)					
			.then((messages: any) => {
				for (let i = 0; i < messages.length; i++) {
					this
						.mongoContext
						.findOne(
							'messages',
							{
								'_id': this.mongoContext.MongoId(messages[i].mongo_id)
							})
						.then((m_message: any) => {
							delete messages[i].mongo_id;
							messages[i].content = m_message.content;
						});
					if (i == messages.length - 1) {
						this
							.mongoContext
							.findOne(
								'messages',
								{
									'_id': this.mongoContext.MongoId(messages[i].mongo_id)
								})
							.then((m_message: any) => {
								delete messages[i].mongo_id;
								messages[i].content = m_message.content;
								this.appRepository.usersCache.setUserInfo(user_id, 'offsetLevelMessage', offsetLevel + 1);
								resolve(messages);
							});
					}
				}
			});
	});
}

	public updateUserData(user_id, update_data) {
	return new Promise((resolve, reject) => {
		if (!update_data.id && !update_data.token && !update_data.phone) {
			let addProps = {};
			let replaceProps = {};
			let addSuccess = false;
			let replaceSuccess = false;
			for (let key in update_data) {
				if (this.appRepository.usersCache[user_id][key]) {
					replaceProps[key] = update_data[key]
				}
				else {
					addProps[key] = update_data[key]
				}
			}
			if (JSON.stringify(addProps) === '{}') {
				addSuccess = true;
			}
			if (JSON.stringify(replaceProps) === '{}') {
				replaceSuccess = true;
			}
			if (addSuccess && replaceSuccess) {
				resolve(RequestTypes.SUCCESS);
			}
			if (!addSuccess) {
				this
					.userProvider
					.addInfo(user_id, addProps)
					.then((res) => {
						addSuccess = true;
						if (addSuccess && replaceSuccess) {
							for (let key in addProps) {
								this.appRepository.usersCache.setUserInfo(user_id, key, addProps[key]);
							}
							resolve(RequestTypes.SUCCESS);
						}
					});
			}
			if (!replaceSuccess) {
				let isError = false;
				let i = 0;
				let length = Object.keys(replaceProps).length;
				for (let key in replaceProps) {
					this.appRepository.usersCache.setUserInfo(user_id, key, replaceProps[key])
					this
						.userProvider
						.replaceInfo(user_id, key, replaceProps[key])
						.then((res) => {
							i++;
							if (i == length) {
								replaceSuccess = true;
								if (addSuccess && replaceSuccess) {
									resolve(RequestTypes.SUCCESS);
								}
							}
						}, (err) => { isError = true });
				}
			}
			let update_event = new HistoryEvent(
				`users:user_${user_id}`,
				`users:user_${user_id}`,
				HistoryEventTypes.UPDATE_USER_DATA,
				Date.now()
			);
			this.historyProvider.addEvent(update_event).then(() => {
				this.appRepository.historyCache.addEvent(update_event);
			});
		}
		else {
			resolve(RequestTypes.ERROR);
		}
	});
}

}
