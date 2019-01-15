import HistoryEventTypes from "../core/HistoryEventTypes";
import SecurityHelper from "../helpers/SecurityHelper";

export default class HistoryEvent {

    public id?: string;
    public subject: string;
    public object: string;
    public type: HistoryEventTypes;
    public time: string;
	
	private securityHelper = new SecurityHelper();
	
	constructor(subject, object, type, time) {
		this.id = this.securityHelper.generateId();
		this.subject = subject;
		this.object = object;
		this.type = type;
		this.time = time;
	}

}