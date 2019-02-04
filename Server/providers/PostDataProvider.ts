import DataProvider from "./DataProvider";
import Post from "../models/Post";

export default class PostDataProvider extends DataProvider {

    constructor() {
        super();
    }

    public addPost(post: Post) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            INSERT DATA {
                GRAPH <${this.sparqlHelper.graphs_uri.posts}> {
                    posts:post_${post.id} type:id "${post.id}" ;
                    posts:wall walls:wall_${post.wall_id} ;
                    type:time "${post.time}" ;
					type:role "post" ;
                    type:owner ${post.owner} .
                }
            }`;
        return this.query(sparql, 'update');
    }

    public getMongoId(post_id) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            SELECT ?mongo_id
            FROM <${this.sparqlHelper.graphs_uri.posts}> {
                posts:post_${post_id} type:mongo_id ?mongo_id .
            }`;
        return this.query(sparql, 'query');
    }

    public getPostInfo(post_id) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            SELECT ?id ?wall_id ?time ?mongo_id ?owner_id ?owner_name
            FROM <${this.sparqlHelper.graphs_uri.posts}> {
                posts:post_${post_id} type:id ?id ;
                type:mongo_id ?mongo_id ;
                posts:wall ?wall ;
                posts:owner ?owner .
                OPTIONAL {
                    GRAPH <${this.sparqlHelper.graphs_uri.walls}> {
                        ?wall type:id ?wall_id
                    }
                }
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
            }`;
        return this.query(sparql, 'query');
	}

	public getPostsForWall(wall_id, offsetLevel) {
		let sparql =
			`${this.sparqlHelper.prefixes}
            SELECT ?id ?time ?mongo_id ?owner_role ?owner_id ?owner_name (COUNT(?watcher) as ?watch_count)
            FROM <${this.sparqlHelper.graphs_uri.posts}>
			WHERE {
                ?post posts:wall walls:wall_${wall_id} ;
                type:time ?time ;
                type:mongo_id ?mongo_id ;
                type:owner ?owner .
				?watcher type:watch ?post
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.users}> {
						?owner type:id ?owner_id ;
                        users:name ?owner_name;
                        type:role ?owner_role
					}
				}
				OPTIONAL {
                    GRAPH <${this.sparqlHelper.graphs_uri.groups}> {
                        ?owner type:id ?owner_id ;
                        groups:name ?owner_name;
                        type:role ?owner_role
                    }
                }
            } LIMIT 30 OFFSET ${offsetLevel * 30}`;
		return this.query(sparql, 'query');
	}

	public watchPost(user_id, post_id) {
		let sparql =
			`${this.sparqlHelper.prefixes}
            INSERT DATA {
                GRAPH <${this.sparqlHelper.graphs_uri.posts}> {
                    users:user_${user_id} type:watch posts:post_${post_id}
                }
            }`;
		return this.query(sparql, 'update');
	}

}