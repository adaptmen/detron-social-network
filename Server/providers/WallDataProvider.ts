import MongoContext from "../core/MongoContext";
import DataProvider from "./DataProvider";
import Wall from "../models/Wall";


export default class WallDataProvider extends DataProvider {

    constructor() {
        super();
    }

    public addWall(wall: Wall): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
			INSERT DATA { 
			  GRAPH <${this.sparqlHelper.graphs_uri.walls}> 
				{ walls:wall_${wall.id} type:id "${wall.id}";
					type:role "wall" ;
					walls:attacher ${wall.attacher} } }`;
		return this.query(sparql, 'update');
    }

    /*public addPost(wall_id, post_id, content, maker, time: string): Promise<any> {
        return this.mongoContext.updateOne('walls', {
            props: {
                wall_id: wall_id
            },
            agregates: {
                '$push': {
                    'post': {
                        '$each': [
                            {
                                post_id,
                                maker,
                                content,
                                time
                            }
                        ]
                    }
                }
            }
        })
        .then((insert_info: any) => {
                let sparql =
                    `${this.sparqlHelper.prefixes} 
                    INSERT DATA { 
                        GRAPH <${this.sparqlHelper.graphs_uri.posts}>
                        { posts:post_${post_id} posts:id "${post_id}";
                        posts:wall walls:wall_${wall_id};
                        type:time "${time}";
                        type:maker ${maker};
                        type:mongo_id "${insert_info.insertedId}" } }`;
                return this.query(sparql, 'update')
        })
    }

    public getAllPostsForWall(wall_id) {
        return this.mongoContext.find('walls', {
            props: {
                wall_id: wall_id
            },
            agregates: {
                'posts': 1,
                '_id': 0
            }
        })
	}*/

	public getOwnerInfo(wall_id) {
		let sparql =
			`${this.sparqlHelper.prefixes}
			SELECT ?id ?name
			{
				GRAPH <${this.sparqlHelper.graphs_uri.walls}> {
					walls:wall_${wall_id} walls:owner ?owner .
				}
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.users}> {
						?owner type:id ?id ;
						users:name ?name
					}
				}
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.groups}> {
						?owner type:id ?id ;
						groups:name ?name
					}
				}
			}`;
		return this.query(sparql, 'query');
	}

    public getWallInfoByOwner(owner: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?wall_id
        FROM <${this.sparqlHelper.graphs_uri.walls}>
        { ?wall walls:owner ${owner}; type:id ?wall_id }`;
        return this.query(sparql, 'query');
    }

    public getSubscribers(wall_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?subscriber_id
        FROM <${this.sparqlHelper.graphs_uri.walls}/wall_${wall_id}> 
        { ?wall walls:id "${wall_id}" .
          OPTIONAL { GRAPH <${this.base_url}/${this.dataset}> 
          { ?subscriber users:subscribe ?wall; users:id ?subscriber_id } } }`;
        return this.query(sparql, 'query');
    }

    public getSubscribersCount(wall_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT (COUNT(?subscriber) AS ?count)
        FROM <${this.sparqlHelper.graphs_uri.walls}/wall_${wall_id}> 
        { ?wall walls:id "${wall_id}" .
          OPTIONAL { GRAPH <${this.base_url}/${this.dataset}> 
          { ?subscriber posts:wall ?wall } } }`;
        return this.query(sparql, 'query');
    }

    public getWall(wall_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?owner_id ?owner_name ?post_id ?post_time ?post_text
        FROM <${this.sparqlHelper.graphs_uri.walls}/wall_${wall_id}> 
        { ?wall walls:id "${wall_id}";
          walls:owner ?owner .
          ?owner type:id ?owner_id .
          ?owner type:name ?owner_name .
          OPTIONAL { GRAPH <${this.sparqlHelper.graphs_uri.posts}> 
          { ?post posts:wall ?wall;
            posts:id ?post_id;
            posts:time ?post_id } } }`;
        return this.query(sparql, 'query');
    }

}
