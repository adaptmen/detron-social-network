

export default class WatchCache {

	public store = {};

	public addWatch(user_id, object, time) {
		if (!this.store[user_id]) {
			this.store[user_id] = {};
		}
		this.store[user_id][object] = time;
	}

	public checkWatch(user_id, object) {
		return this.store[user_id][object] ? true : false;
	}

}