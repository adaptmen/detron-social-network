import MongoContext from "../core/MongoContext";
import DataProvider from "./DataProvider";
import SqlContext from "../core/SqlContext";


export default class WallDataProvider extends DataProvider {

    public sqlContext: SqlContext;

    constructor(sqlContext: SqlContext) {
        super();
        this.sqlContext = sqlContext;
    }

    public addWall(wall_id, attacher): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
			INSERT DATA { 
			  GRAPH <${this.sparqlHelper.graphs_uri.walls}> 
				{ walls:wall_${wall_id} type:id "${wall_id}";
					type:role "wall" ;
					walls:attacher ${attacher} } }`;
		return this.query(sparql, 'update');
    }

    public addPost(wall_id, maker_id, content) {
        let time = Date.now();
        let post_id = this.securityHelper.generateFileId();
        let sparql =
            `${this.sparqlHelper.prefixes}
            INSERT DATA {
                GRAPH <${this.sparqlHelper.graphs_uri.posts}> {
                    posts:post_${post_id} type:id "${post_id}" ;
                    posts:wall walls:wall_${wall_id} ;
                    type:time "${time}" ;
                    type:role "post" ;
                    type:maker users:user_${maker_id} .
                }
            }`;
        return new Promise((resolve, reject) => {
            this.query(sparql, 'update').then((res) => {
                this
                .sqlContext
                .db('app')
                .query(`INSERT INTO ?? (id, maker_id, wall_id, time, content)
                    VALUES (?, ?, ?, ?, ?)`, 
                    ['posts', post_id, maker_id, wall_id, time, content])
                .then((ans) => {
                    resolve(post_id);
                });
            });
        });
    }

    public getPostsForWall(wall_id, offsetLevel) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            SELECT ?id ?time ?owner_id ?owner_name
            FROM <${this.sparqlHelper.graphs_uri.posts}>
            WHERE {
                ?post posts:wall walls:wall_${wall_id} ;
                type:time ?time ;
                type:owner ?owner .
                OPTIONAL {
                    GRAPH <${this.sparqlHelper.graphs_uri.users}> {
                        ?owner type:id ?owner_id ;
                        users:name ?owner_name
                    }
                }
                OPTIONAL {
                    GRAPH <${this.sparqlHelper.graphs_uri.groups}> {
                        ?owner type:id ?owner_id ;
                        groups:name ?owner_name
                    }
                }
            } LIMIT 30 OFFSET ${offsetLevel * 30}`;
        return new Promise((resolve, reject) => {
            this
            .query(sparql, 'query')
            .then((posts) => {
                if (posts.length == 0) return resolve([]);
                let posts_ids = [];
                posts.forEach((post) => {
                    posts_ids.push(post.id);
                });
                this.sqlContext.db('app')
                .query(`SELECT ??, ??, ?? FROM ?? WHERE id IN (?)`,
                 ['id, content', 'wall_id', 'posts', posts_ids])
                .then((s_posts: any) => {
                    s_posts.forEach((s_post) => {
                        posts.forEach((post) => {
                            if (s_post['id'] == post['id']) {
                                post['content'] = s_post['content']
                            }
                        });
                    });
                    resolve(posts);
                });
            });
        });
    }

	public getOwnerInfo(wall_id) {
		let sparql =
			`${this.sparqlHelper.prefixes}
			SELECT ?id ?name
			{
				GRAPH <${this.sparqlHelper.graphs_uri.walls}> {
					walls:wall_${wall_id} walls:attacher ?owner .
				}
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.users}> {
						?owner type:id ?id
					}
				}
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.groups}> {
						?owner type:id ?id
					}
				}
			}`;
		return this.query(sparql, 'query');
	}

    public checkOwner(wall_id, user_id) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            ASK WHERE
            {
                GRAPH <${this.sparqlHelper.graphs_uri.walls}>
                { 
                    walls:wall_${wall_id} walls:attacher users:
                }
            }}`;
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
