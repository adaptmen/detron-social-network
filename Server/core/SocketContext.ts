import * as socketIo from 'socket.io';
import UserDataProvider from '../providers/UserDataProvider';
import AppRepository from './AppRepository';
import MessageDataProvider from '../providers/MessageDataProvider';
import ChatDataProvider from '../providers/ChatDataProvider';
import WallDataProvider from '../providers/WallDataProvider';
import FileDataProvider from '../providers/FileDataProvider';
import SecurityHelper from '../helpers/SecurityHelper';
import MongoContext from './MongoContext';
import HistoryDataProvider from '../providers/HistoryDataProvider';
import DbContext from './DbContext';
import Group from '../models/Group';
import Wall from '../models/Wall';
import HistoryEvent from '../models/HistoryEvent';
import HistoryEventTypes from './HistoryEventTypes';
import Message from '../models/Message';
import ClientMessage from '../models/ClientMessage';
import ChatsCache from './ChatsCache';
import Post from '../models/Post';
import RequestTypes from './RequestTypes';
import Answer from './Answer';
import Notify from '../models/Notify';
import GraphVertex from './GraphVertex';
import Chat from '../models/Chat';


export default class SocketContext {

	private mongoContext: MongoContext;

	private dbContext: DbContext;
	private appRepository: AppRepository;
	private securityHelper = new SecurityHelper();
	private io: socketIo.Server;

	public onSocketInit: (context: SocketContext) => void;
	public user: any = {};

	constructor(io: any,
		appRepository: AppRepository,
		dbContext: DbContext,
		mongoContext: MongoContext) {

		this.dbContext = dbContext;
		this.mongoContext = mongoContext;

		this.io = io;
		console.log('socket io started');
		this.appRepository = appRepository;
		this.io.use((_socket, next) => {
			const authData = _socket.handshake.query;
			console.log('AuthData: ', authData);
			console.log('Auth user: ', this.appRepository.authList[authData['phone']]);
			if (this.appRepository.authList[authData.phone].token == authData.token) {
				next();
			} else {
				next(new Error('not auth'))
			}
		});

		this.io.sockets.on('connection', (socket: any) => {

			console.log("Connect", socket.id);
			const authData = socket.handshake.query;

			let repUser = this.appRepository.getUser
				(this.appRepository.authList[authData.phone].id);

			socket.user = {
				id: repUser.id
			};

			this.send.self(socket, new Answer(
				RequestTypes.SYNC_NOTIFY,
				this.appRepository.notifyCache.getUnwatched(socket.user.id)
			));

			this.appRepository.attachSocket(socket.user.id, socket.id);

			/*for (let userSub in this.appRepository.subscriptions[repUser.id]) {

				if (this.appRepository.subscriptions[repUser.id][userSub] == 'chat') {
					socket.join(userSub);
				}
				else {
					break;
				}
			}*/

			console.log('Connected user: ', socket.user.id);

			socket.emit(RequestTypes.USER_INIT, repUser);

			socket.on('test', (info) => {
				console.log(info);
				socket.emit('test', 456);
			});

			socket.on('disconnect', () => {
				console.log('Disconnect user: ', socket.user.id);
				this.appRepository.detachSocket(socket.user.id);
			});

            /*socket.on('openPersonalDialog', (companionId) => {
                let chatsByUser = this.appRepository.getChats(socket.user.id);
                let chat;

                chatsByUser.forEach((_chat) => {
                    if (this.appRepository.chats[_chat.id].subscribers[socket.user.id]
                        && this.appRepository.chats[_chat.id].subscribers[companionId]
                        && _chat.privacy == 'private'
                    ) {
                        return chat = _chat;
                    }
                });

                if (chat) {
                    socket.join(chat.id);
                    socket.emit('openPersonalDialogResult', { id: chat.id });
                }
                else {
                    let chat_id = this.securityHelper.generateId();
                    this
                        .chatProvider
                        .addPersonalChat(chat_id, socket.user.id, companionId)
                        .then((res) => {
                            this.appRepository.createChat(chat_id, 'private', socket.user.id, companionId);
                            socket.join(chat_id);
                            socket.emit('openPersonalDialogResult', { id: chat_id });
                        });
                }
            });*/

			socket.on('getPersonalChatInfo', (chatId) => {
				let chat = this.appRepository.getChatInfo(chatId, socket.user.id);
				socket.emit('getPersonalChatInfoResult', chat);
			});

			socket.on(RequestTypes.CREATE_GROUP, (info) => {
				let new_group = new Group(socket.user.id, info.name);
				let new_wall = new Wall(`groups:group_${new_group.id}`);

				this
					.dbContext
					.createGroup(new_group, new_wall)
					.then(() => {
						this.send.self(socket, new Answer(RequestTypes.CREATE_GROUP, RequestTypes.SUCCESS));
					});
			});

			socket.on(RequestTypes.CREATE_POST, (post: Post) => {
				this
					.dbContext
					.createPost(post)
					.then(() => {
						this.send.self(socket, new Answer(RequestTypes.CREATE_POST, RequestTypes.SUCCESS));
					});
			});

			socket.on(RequestTypes.GET_WALL, (info) => {
				let offsetLevel = this
					.appRepository
					.usersCache
					.getUser(socket.user.id)['offsetLevelPosts'];
				this
					.dbContext
					.getWall(info.id, offsetLevel, socket.user.id)
					.then((wall) => {
						this
							.appRepository
							.usersCache
							.setUserInfo(socket.user.id, 'offsetLevelPosts', offsetLevel + 1);
						this.send.self(socket, new Answer(RequestTypes.GET_WALL, wall));
					});
			});

			socket.on('getAllUsers', (info) => {
				//this.userProvider.getAllUsers()
				//    .then((users) => {
				//        socket.emit('getAllUsersResult', users)
				//    });
			});

			socket.on('getPageById', (info) => {
				let user = this.appRepository.getUser(info.id);
				socket.emit('getPageByIdResult', {
					id: user.id,
					phone: user.phone,
					name: user.name
				});
			});

			socket.on(RequestTypes.OPEN_CHAT, (info) => {
				this
					.dbContext
					.openChat(socket.user.id, info.companion_id).then((chat_id) => {
						this
							.appRepository
							.usersCache
							.setUserInfo(socket.user.id, 'offsetLevelMessage', 0);
						this.send.self(socket, new Answer(RequestTypes.OPEN_CHAT, chat_id));
					});
			});

			socket.on(RequestTypes.GET_MESSAGES, (info) => {
				this
					.dbContext
					.getMessages(info.chat_id, socket.user.id)
					.then((messages) => {
						socket.emit(RequestTypes.GET_MESSAGES, messages);
					});
			});

			socket.on(RequestTypes.GET_NEWS, () => {
				this
					.dbContext
					.getNews(socket.user.id)
					.then((posts) => {
						this.send.self(socket, new Answer(RequestTypes.GET_NEWS, posts));
					});
			});

			socket.on(RequestTypes.GET_CHATS, () => {
				socket.emit(RequestTypes.GET_CHATS, this.appRepository.getChats(socket.user.id));
			});

			socket.on(RequestTypes.SEND_MESSAGE, (client_msg: ClientMessage) => {

				let new_message = new Message(client_msg.chat_id, socket.user.id, Date.now());

				this
					.dbContext
					.createMessage(new_message)
					.then(() => {
						let chat_event = new HistoryEvent(
							new_message.chat_id,
							new_message.id,
							HistoryEventTypes.NEW_MESSAGE,
							new_message.time);

						let user_event = new HistoryEvent(
							socket.user.id,
							chat_event.id,
							HistoryEventTypes.HISTORY_EVENT,
							new_message.time);

						this.appRepository.historyCache.addEvent(chat_event);
						this.appRepository.historyCache.addEvent(user_event);

						this
							.appRepository
							.chatsCache
							.getSubscribers(new_message.chat_id)
							.forEach((user_id) => {
								let new_notify = this.appRepository.notifyCache.addNotify(user_id, chat_event.id);
								let sid = this.appRepository.getSocketId(user_id);
								if (sid) {
									this.send.toSocket(
										socket,
										sid,
										new Answer(RequestTypes.SYNC_NOTIFY, [new_notify])
									);
								}
							});
					});
			});

			socket.on(RequestTypes.SYNC_NOTIFY, (notify: Notify) => {
				let event = this
					.appRepository
					.historyCache
					.getEvent(
						this
							.appRepository
							.notifyCache
							.getNotify(
								socket.user.id,
								notify.id
							)
							.event_id
					);

				switch (event.type) {
					case HistoryEventTypes.NEW_MESSAGE:
						this
							.dbContext
							.getMessage(
								new GraphVertex(event.object).id,
								new GraphVertex(event.subject).id
							)
							.then((message) => {
								this.send.self(socket, new Answer(RequestTypes.NEW_MESSAGE, message));
							});
						break;
				}

			});

			socket.on(RequestTypes.UPDATE_USER_DATA, (update_data) => {
				console.log('Данные для обновления: ', update_data);
				this
					.dbContext
					.updateUserData(
						socket.user.id,
						update_data
					)
					.then((result: RequestTypes) => {
						if (result === RequestTypes.SUCCESS) {
							this
								.send.self(socket, new Answer(
									RequestTypes.UPDATE_USER_DATA,
									RequestTypes.SUCCESS
								)
								)
						} else {
							this
								.send.self(socket, new Answer(
									RequestTypes.UPDATE_USER_DATA,
									RequestTypes.ERROR
								)
								)
						}
					});
			});

			socket.on('accessFile', (info) => {
				let access_token = this.securityHelper.generateId();
				//this.fileProvider.addToken(access_token, socket.user.f_token || "", socket.user.id, info.privacy || 'public');
				socket.emit('accessFile', { code: "access_code", answer: { access_code: access_token } });
			});

		});

	}

	public send = {
		self: (socket, answer: Answer) => {
			socket.emit(answer.code, answer.answer);
		},
		toRoom: (socket, roomName: string, eventName: string, msg: any) => {
			socket.broadcast.to(roomName).emit(eventName, msg);
		},
		toRoomAndSelf: (roomName: string, eventName: string, msg: any) => {
			this.io.sockets.in(roomName).emit(eventName, msg);
		},
		all: (socket, eventName: string, msg: any) => {
			socket.broadcast.emit(eventName, msg);
		},
		allAndSelf: (eventName: string, msg: any) => {
			this.io.emit(eventName, msg);
		},
		toSocket: (socket, socketId: string, answer: Answer) => {
			socket.broadcast.to(socketId).emit(answer.code, answer.answer);
		}
	};

	public joinTo(socket, room_id) {
		socket.join(room_id);
	}

	public getRoom(room_id) {
		return this.io.sockets.adapter.rooms[room_id];
	}

}
