import DataProvider from "./DataProvider";

export default class GroupDataProvider extends DataProvider {

	constructor() {
		super();
	}
	
	public addGroup(group: any) {
		let sparql =
			`${this.sparqlHelper.prefixes}
			INSERT DATA { 
				GRAPH <${this.sparqlHelper.graphs_uri.groups}> 
				{ 
					groups:group_${group.id} type:id "${group.id}";
				  	type:owner users:user_${group.owner_id} ;
					type:role "group" ;
				  	groups:name "${group.name}" ;
					type:wall walls:wall_${group.wall_id} } }`;
		return this.query(sparql, 'update');
	}
	
	public getWall(group_id) {
		let sparql =
			`${this.sparqlHelper.prefixes}
			SELECT ?wall_id  
			FROM <${this.sparqlHelper.graphs_uri.walls}> 
			{ ?wall walls:attacher groups:group_${group_id};
					type:id ?wall_id } }`;
		return this.query(sparql, 'query');
	}
	
}