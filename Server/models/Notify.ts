import NotifyTypes from "../core/NotifyTypes";
import SecurityHelper from "../helpers/SecurityHelper";

export default class Notify {
	
	public id: string;
    public event_id?: string;
    public watched?: boolean;

	private securityHelper: SecurityHelper = new SecurityHelper();
	
    constructor(event_id) {
		this.id = this.securityHelper.generateId();
        this.event_id = event_id;
        this.watched = false;
    }

}