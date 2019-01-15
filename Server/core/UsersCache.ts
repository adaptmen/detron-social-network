

export default class UsersCache {

    public store = {};

	public addUser(user) {
		user['offsetLevelPosts'] = 0;
		user['offsetLevelMessage'] = 0;
		user['offsetLevelNews'] = 0;
        this.store[user.id] = user;
    }

    public getUser(user_id) {
        return this.store[user_id];
    }

    public setUserInfo(user_id, prop, value) {
        this.store[user_id][prop] = value;
    }

}