import * as socketIo from 'socket.io';
import SecurityHelper from '../helpers/SecurityHelper';
import AccessHelper from '../helpers/AccessHelper';
import DbContext from './DbContext';
import AuthRepository from './AuthRepository';
import AppTypes from './AppTypes';
import SocketTypes from './SocketTypes';
import * as cookie from 'cookie';

export default class SocketContext {

	private dbContext: DbContext;
	private authRepository: AuthRepository;
	private securityHelper = new SecurityHelper();
	private accessHelper = new AccessHelper(this.dbContext);
	private io: socketIo.Server;

	public onSocketInit: (context: SocketContext) => void;
	public user: any = {};

	constructor(io: any,
		dbContext: DbContext,
		authRepository: AuthRepository) {

		this.dbContext = dbContext;
		this.authRepository = authRepository;
		this.io = io;

		console.log('socket io started');
		
		this.io.use((_socket, next) => {
			let cookies = cookie.parse(_socket.handshake.headers['cookie']);
			const authToken = cookies['t'];
			const tokenStatus = this.authRepository.checkToken(authToken);
			if (tokenStatus === AppTypes.SUCCESS) {
				next();
			} 
			else {
				next(new Error('not auth'))
			}
		});

		this.io.sockets.on('connection', (socket: any) => {
			const token = cookie.parse(socket.handshake.headers['cookie'])['t'];

			this
			.dbContext
			.getUserInit(this.authRepository.getByToken(token).login)
			.then((data: any) => {
				console.log(data);
				socket.user = data.user;
				console.log('Connected user:', socket.user.id);

				setTimeout(() => {
					socket.emit(SocketTypes.APP_INIT, data);
					console.log(socket.user.id, SocketTypes.APP_INIT);
				}, 1000);

				socket.on('disconnect', () => {
					console.log('Disconnect user: ', socket.user.id);
				});

			});

			let sendAnswer = (id, type, msg) => {
				socket.emit(`${type}_${id}`, msg);
			};

			socket.on(SocketTypes.SOCKET_REQUEST, (body) => {
				let r_id = body['id'];
				let r_type = body['type'];
				let r_msg = body['msg'];

				/*let rsocket = (body) => {
					let signals = {};
					return {
						on: (type, fun) => {
							fun();
						}
					};
				};*/

				if (r_type == SocketTypes.GET_UPLOAD_TOKEN) {
					this
					.dbContext
					.checkUploadAccess(socket.user.id, r_msg.object_fid)
					.then((res) => {
						if (res === AppTypes.SUCCESS) {
							sendAnswer(
								r_id,
								SocketTypes.GET_UPLOAD_TOKEN,
								this.dbContext
								.generateUploadToken(socket.user.id, r_msg.object_fid)
							);
							
						}
						else {
							sendAnswer(r_id, SocketTypes.GET_UPLOAD_TOKEN, SocketTypes.DENIED);
						}
					});
				}
				else if (r_type == SocketTypes.GET_PAGE) {
					this
					.dbContext
					.getPage(r_msg.id)
					.then((ans: any) => {
						if (ans == AppTypes.NOT_EXIST) {
							sendAnswer(
								r_id,
								SocketTypes.GET_PAGE,
								AppTypes.NOT_EXIST
							);
						}
						else if (ans.id) {
							sendAnswer(
								r_id,
								SocketTypes.GET_PAGE,
								ans
							);
						}
					});
				}
				else if (r_type == SocketTypes.GET_WALL_FILES) {
					this
					.dbContext
					.getFileList(`walls:wall_${r_msg.id}`)
					.then((file_list: any) => {
						file_list.forEach((s_file) => {
							s_file['file_url'] = `/disk/wall_${r_msg.id}/${s_file['id']}`;
							delete s_file['id'];
						});
					});
				}
				else if (r_type == SocketTypes.UPDATE_USER_DATA) {
					this
					.accessHelper
					.checkOwner(r_msg.obj_fid, socket.id)
					.then((res) => {
						
					});
				}

			});

			socket.on(SocketTypes.GET_CHATS, () => {
				this
				.dbContext
				.getChats(socket.user.id)
				.then((chats) => {
					socket.emit(SocketTypes.GET_CHATS, chats);
				});
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

class Answer {
	public code: any;
	public answer: any;
}