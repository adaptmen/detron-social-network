import Notify from "../models/Notify";


export default class NotifyCache {

    constructor() { }

    public store = {};

    public addNotify(user_id, event_id) {
		
		let new_notify = new Notify(event_id);
		
        if (!this.store[user_id])
            this.store[user_id] = {};

        this.store[user_id][new_notify.id] = new_notify;
		
		return new_notify;
    }

    public watchNotify(user_id, notify_id) {
        this.store[user_id][notify_id].watched = true;
	}

	public getNotify(user_id, notify_id): Notify {
		return this.store[user_id][notify_id];
	}

    public getUnwatched(user_id): Notify[] {
        return this
            .store[user_id]
            .values()
            .filter((notify) => {
                return notify.watched === false
            });
    }

}