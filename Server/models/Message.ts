import SecurityHelper from "../helpers/SecurityHelper";

export default class Message {
	
	public id: string;
	public time: string;
	public chat_id: string;
	public mongo_id?: string;
	public content?: string;
	public maker_id: string;
	
	private securityHelper = new SecurityHelper();
	
	constructor(chat_id, maker_id, time) {
		this.id = this.securityHelper.generateId();
		this.time = time;
		this.chat_id = chat_id;
		this.maker_id = maker_id;
	}
	
}