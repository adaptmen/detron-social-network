import SecurityHelper from "../helpers/SecurityHelper";


export default class Post {

    public id?: string;
    public time?: string;
    public mongo_id?: string;
    public content?: string;
	public watch_count: any;

    public wall_id: string;
    public owner: string;

    private securityHelper: SecurityHelper = new SecurityHelper();

    constructor(wall_id, owner, content) {
        this.id = this.securityHelper.generateId();
        this.time = String(Date.now());
        this.wall_id = wall_id;
        this.owner = owner;
        this.content = content;
    }

}