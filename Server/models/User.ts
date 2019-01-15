import SecurityHelper from "../helpers/SecurityHelper";

export default class User {

	public id: string;
	public name: string;
	public phone: string;
	public f_token: string;
	public token: string;

	private securityHelper = new SecurityHelper();
	
	constructor(phone) {
		this.id = this.securityHelper.generateId();
		this.token = this.securityHelper.generateToken();
		this.f_token = this.securityHelper.generateToken();
		this.name = phone;
		this.phone = phone;
	}	

}