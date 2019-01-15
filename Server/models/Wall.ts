import SecurityHelper from "../helpers/SecurityHelper";

export default class Wall {

	public id: string;
	public attacher: string;
	
	private securityHelper = new SecurityHelper();
	
	constructor(attacher: string) {
		this.id = this.securityHelper.generateId();	
		this.attacher = attacher;
	}
}