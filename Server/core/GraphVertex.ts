

export default class GraphVertex {

	public prefix: any;
	public type: any;
	public id: any;

	constructor(graph_string) {
		let matches = graph_string.match(/(\w+):(\w+)_([^.]*)/);
		this.prefix = matches[1];
		this.type = matches[2];
		this.id = matches[3];
	}

}