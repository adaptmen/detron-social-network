import SecurityHelper from "../helpers/SecurityHelper";

export default class Chat {

	public id?: string;
	public subscribers: string[];
	public privacy: string;

	private securityHelper = new SecurityHelper();

	constructor(owner_id, companion_id) {
		this.id = this.securityHelper.generateId();
		this.subscribers.push(owner_id);
		this.subscribers.push(companion_id);
		this.privacy = 'private';
	}

}