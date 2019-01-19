import SnapshotProvider from '../providers/SnapshotProvider';
import TimeEvent from '../models/TimeEvent';
import TimeCache from './TimeCache';
import HistoryCache from './HistoryCache';
import UsersCache from './UsersCache';
import NotifyCache from './NotifyCache';
import ChatsCache from './ChatsCache';
import WatchCache from './WatchCache';


export default class AppRepository {

    private snapshotProvider = new SnapshotProvider();

    constructor() {

    }

    public chatsCache: ChatsCache = new ChatsCache();
    public timeCache: TimeCache = new TimeCache();
	public watchCache: WatchCache = new WatchCache();
    public usersCache: UsersCache = new UsersCache();
    public notifyCache: NotifyCache = new NotifyCache();
    public historyCache: HistoryCache = new HistoryCache();

    public messages = {};
    public authList = {};

    public subscriptions = {};
    public chats = {};

	public onInit: () => void;

    private usersReady = false;
    private chatsReady = false;
    private historyReady = false;
    private messagesReady = false;

    private start() {
        if (this.usersReady
            && this.messagesReady
            && this.historyReady
            && this.chatsReady)
        {
            this.onInit();
        }
    }

    public attachSocket(userId, socketId) {
        this.usersCache.setUserInfo(userId, '_id', socketId);
        this.usersCache.setUserInfo(userId, 'status', UserStatus.ONLINE);
    }

    public detachSocket(userId) {
        this.usersCache.setUserInfo(userId, '_id', null);
        this.usersCache.setUserInfo(userId, 'status', UserStatus.OFFLINE);
    }
	
	public getSocketId(user_id) {
		if (this.usersCache.getUser(user_id)['_id']) {
			return this.usersCache.getUser(user_id)['_id'];
		}
		else {
			return false;
		}
	}

    public checkTimeBanned = this.timeCache.checkBanned;

    /*public getMessagesForChat(chatId, offsetLevel) {
        let messages = Object.entries(this.messages[chatId]);

        let start = this.MESSAGE_OFFSET * (offsetLevel + 1);
        let end = this.MESSAGE_OFFSET * offsetLevel;
        let diff = messages.length - this.MESSAGE_OFFSET * offsetLevel;
        if (diff < this.MESSAGE_OFFSET) {
            let result = [];
            messages.forEach((msg: any) => {
                result.push(Object.assign({ id: msg[0], maker_name: this.usersCache[msg[1].maker_id].name }, msg[1]));
            });
            return result.slice(0, diff)
        }
        else {
            let result = [];
            messages.forEach((msg: any) => {
                result.push(Object.assign({ id: msg[0], maker_name: this.usersCache[msg[1].maker_id].name }, msg[1]));
            });
            return result.slice(result.length - start, result.length - end);
        }
    }*/

    public getChats(userId) {
        let results = [];
        for (let sub in this.subscriptions[userId]) {
            if (this.subscriptions[userId][sub] == 'chat') {
                results.push(this.getChatInfo(sub, userId))
            }
        }
        return results;
    }

    public getChatInfo(chatId, userId) {
        let isPrivate = this.chats[chatId].privacy == 'private';
        let chatName = '';
        if (isPrivate) {
            for (let key in this.chats[chatId].subscribers) {
                if (key != userId && this.chats[chatId].subscribers[key] == true) {
                    chatName = this.usersCache[key].name;
                    break;
                }
            }
        }
    }

    public getUser = this.usersCache.getUser;

    public createUser(user) {
        this.usersCache.addUser(user);
        this.authList[user.phone] = {
            token: user.token,
            id: user.id
        };
    }

    public subscribeUser(userId, objectId, objectType: string) {
        if (this.subscriptions[userId]) {
            this.subscriptions[userId][objectId] = objectType;
        }
        else {
            this.subscriptions[userId] = {};
            this.subscriptions[userId][objectId] = objectType;
        }
    }

    public checkUser(phone, token) {
        return this.authList[phone]['token'] == token
    }

    public checkInAuth(phone) {
        return this.authList[phone]
    }

    public addMessage(msg) {
        if (!this.messages[msg.chat_id]) {
            this.messages[msg.chat_id] = {};
            this.messages[msg.chat_id][msg.id] = {
                time: msg.time,
                content: msg.content,
                maker_id: msg.maker_id
            };
        }
        else {
            this.messages[msg.chat_id][msg.id] = {
                time: msg.time,
                content: msg.content,
                maker_id: msg.maker_id
            };
        }
    }

    public takeSnapshot() {
        this
            .snapshotProvider
            .getUsers()
            .then((users) => {
                users.forEach((user) => {
                    this.createUser(user);
                });
                this.usersReady = true;
                this.start();
            });

        /*this
            .snapshotProvider
            .getMessages()
            .then((messages) => {
                messages.forEach((msg) => {
                    if (this.messages[msg.chat_id]) {
                        this.messages[msg.chat_id][msg.id] = {
                            time: msg.time,
                            content: msg.content,
                            maker_id: msg.maker_id
                        };
                    }
                    else {
                        this.messages[msg.chat_id] = {};
                        this.messages[msg.chat_id][msg.id] = {
                            time: msg.time,
                            content: msg.content,
                            maker_id: msg.maker_id
                        }
                    }
                });
                this.messagesReady = true;
                this.start();
            });*/

        /*this
            .snapshotProvider
            .getChats()
            .then((chats) => {
                chats.forEach((chat) => {
                    if (this.chats[chat.chat_id]) {
                        if (!this.chats[chat.chat_id].subscribers) {
                            this.chats[chat.chat_id].subscribers = {};
                            this.chats[chat.chat_id].subscribers[chat.user_id] = true;
                        }
                        else {
                            this.chats[chat.chat_id].subscribers[chat.user_id] = true;
                        }
                    }
                    else {
                        this.chats[chat.chat_id] = {};
                        this.chats[chat.chat_id]['privacy'] = chat.privacy;
                        this.chats[chat.chat_id].subscribers = {};
                        this.chats[chat.chat_id].subscribers[chat.user_id] = true;
                    }

                    if (this.subscriptions[chat.user_id]) {
                        this.subscriptions[chat.user_id][chat.chat_id] = 'chat';
                    }
                    else {
                        this.subscriptions[chat.user_id] = {};
                        this.subscriptions[chat.user_id][chat.chat_id] = 'chat';
                    }
                });
                console.log('Chats: ', this.chats);
                console.log('Subscriptions: ', this.subscriptions);
                this.chatsReady = true;
                this.start();
            });*/

        this
            .snapshotProvider
            .getHistory()
            .then((history: any[]) => {
                history.forEach((event) => {
                    this.historyCache.addEvent(event);
                });
                this.historyReady = true;
                this.start();
            });

    }

}
