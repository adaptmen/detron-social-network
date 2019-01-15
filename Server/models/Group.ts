import SecurityHelper from "../helpers/SecurityHelper";

export default class Group {

	public id: string;
	public owner_id: string;
	public name: string;
	public wall_id: string;
	
	private securityHelper = new SecurityHelper();

	constructor(owner_id, name) {
		this.id = this.securityHelper.generateId();
		this.owner_id = owner_id;
		this.name = name;
	}

}