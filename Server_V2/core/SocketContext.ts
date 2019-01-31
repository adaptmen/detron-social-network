import * as socketIo from 'socket.io';
import SecurityHelper from '../helpers/SecurityHelper';
import DbContext from './DbContext';
import AuthRepository from './AuthRepository';
import AppTypes from './AppTypes';
import SocketTypes from './SocketTypes';

export default class SocketContext {

	private dbContext: DbContext;
	private authRepository: AuthRepository;
	private securityHelper = new SecurityHelper();
	private io: socketIo.Server;

	public onSocketInit: (context: SocketContext) => void;
	public user: any = {};

	constructor(io: any,
		dbContext: DbContext,
		authRepository: AuthRepository) {

		this.dbContext = dbContext;
		this.io = io;

		console.log('socket io started');
		
		this.io.use((_socket, next) => {
			const authToken = _socket.handshake.query.t;
			const tokenStatus = this.authRepository.checkToken(authToken);
			if (tokenStatus === AppTypes.SUCCESS) {
				next();
			} 
			else {
				next(new Error('not auth'))
			}
		});

		this.io.sockets.on('connection', (socket: any) => {
			const token = socket.handshake.query.t;

			this
			.dbContext
			.getUser(this.authRepository.getByToken(token).login)
			.then((user: any) => {
				socket.user = {
					id: user.id
				};
				console.log('Connected user: ', socket.user.id);

				socket.emit(SocketTypes.APP_INIT, user);

				socket.on('disconnect', () => {
					console.log('Disconnect user: ', socket.user.id);
				});

			});

			let prosocket = (() => {
				let listens = {};
				return {
					on: (type, listener) => {
						if (!listens[type]) {
							listens[type] = [];
							listens[type].push(listener);
						}
					}
				}
			})();

			let sendAnswer = (id, type, msg) => {
				socket.emit(`${type}_${id}`, msg);
			};

			socket.on(SocketTypes.SOCKET_REQUEST, (body) => {
				let r_id = body['id'];
				let r_type = body['type'];
				let r_msg = body['msg'];

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

			});

			socket.on(SocketTypes.GET_CHATS, () => {
				this
				.dbContext
				.getChats(socket.user.id)
				.then((chats) => {
					socket.emit(SocketTypes.GET_CHATS, chats);
				});
			})

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