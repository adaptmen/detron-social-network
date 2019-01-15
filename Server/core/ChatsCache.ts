

export default class ChatsCache {
	
	public store = {};

	public addChat(chat: any) {
		this.store[chat.id] = chat;
	}
	
	public addSubscriber(chat_id, user_id) {
		this.store[chat_id].subscribers[user_id] = '';
	}
	
	public removeSubscriber(chat_id, user_id) {
		delete this.store[chat_id].subscribers[user_id];
	}
	
	public setChatInfo(chat_id, prop, value) {
		this.store[chat_id][prop] = value;
	}
	
	public getSubscribers(chat_id) {
		return this.store[chat_id].subscribers.keys();
	}
	
}