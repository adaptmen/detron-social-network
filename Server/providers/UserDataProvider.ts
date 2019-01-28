import DataProvider from "./DataProvider";
import SqlContext from '../core/SqlContext';

export default class UserDataProvider extends DataProvider {

    public sqlContext: SqlContext;

    constructor(sqlContext: SqlContext) {
        super();
        this.sqlContext = sqlContext;
    }

    public insertUser(user_id, login, password, token, ftoken: string): Promise<any> {
        return this
        .sqlContext
        .query(`INSERT INTO users 
            (id, name, login, password, token, ftoken)
             VALUES ('${user_id}', '${login}', '${login}', '${password}', '${token}', '${ftoken}')`).then((res) => {
             let sparql =
                `${this.sparqlHelper.prefixes}
                INSERT DATA
                {
                    GRAPH <${this.sparqlHelper.graphs_uri.users}>
                    {
                        users:user_${user_id} type:id "${user_id}" ;
                        users:name "${login}"
                        users:login "${login}"
                        type:role "user" ;
                        type:created_at "${Date.now()}" .
                }}`;
            return this.query(sparql, 'update');
        });
    }

    public getUserById(userId): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?id ?name
			FROM <${this.sparqlHelper.graphs_uri.users}> 
			{ ?user type:id "${userId}" .
			  ?user users:name ?name; 
					type:id ?id .
			}`;
        return this.query(sparql, 'query');
    }

    public checkAccess(login, password) {
        let sql = `SELECT (login, password)
         FROM \`users\` WHERE 'login' = ${login}, 'password' = ${password}`;
         return this.sqlContext.query(sql);
    }

    public checkExist(login) {
        let sql = `SELECT login FROM \`users\` WHERE 'login' = ${login}`;
        return this.sqlContext.query(sql);
    }


    public getAllUsers(): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?id ?name
			FROM <${this.sparqlHelper.graphs_uri.users}> 
			{ ?user users:name ?name; 
					type:id ?id .
			}`;
        return this.query(sparql, 'query');
    }

    public getChats(user_id): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?chat_id
			{
				GRAPH <${this.sparqlHelper.graphs_uri.users}>  {
					users:user_${user_id} type:subscribe ?chat .
				}
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.chats}>  {
						?chat type:role "chat" ;
						type:id ?chat_id .
					}
				}
			}`;
        return this.query(sparql, 'query');
    }

    public mateWithUser(user_id, mate_id) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            INSERT DATA
            {
              GRAPH <${this.sparqlHelper.graphs_uri.users}>
              {
                users:user_${user_id} users:mate users:user_${mate_id} 
              }}`;
        return this.query(sparql, 'update');
    }

    public getFriends(user_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
            SELECT ?friend_id
            FROM <${this.sparqlHelper.graphs_uri.users}> 
            {
              users:user_${user_id} users:mate ?friend .
              ?friend users:mate users:user_${user_id} .          
            }`;
        return this.query(sparql, 'query');
    }

    public getMates(user_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
            SELECT ?mate_id
            FROM <${this.sparqlHelper.graphs_uri.users}> 
            {
              users:user_${user_id} users:mate ?mate .
              ?mate type:id ?mate_id .
            } FILTER NOT EXISTS {
                ?partner users:mate users:user_${user_id}
            }`;
        return this.query(sparql, 'query');
    }

    public getPartners(user_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
            SELECT ?partner_id
            FROM <${this.sparqlHelper.graphs_uri.users}> 
            {
              ?partner users:mate users:user_${user_id} .
              ?partner type:id ?partner_id .          
            } FILTER NOT EXISTS {
                users:user_${user_id} users:mate ?mate
            }`;
        return this.query(sparql, 'query');
	}

	public getNews(user_id, offsetLevel) {
		let sparql =
			`${this.sparqlHelper.prefixes}
            SELECT ?id ?time ?mongo_id ?wall_id ?wall_owner_name ?wall_owner_id ?owner_id ?owner_name (COUNT(?watcher) as ?watch_count)
            {
				GRAPH <${this.sparqlHelper.graphs_uri.users}> {
					users:user_${user_id} type:subscribe ?wall .
				}
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.walls}> {
						?wall type:role "wall" ;
						type:id ?wall_id ;
						walls:attacher ?wall_owner .
						OPTIONAL {
							GRAPH <${this.sparqlHelper.graphs_uri.users}> {
								?wall_owner type:id ?wall_owner_id ;
								users:name ?wall_owner_name .
							}
						}
						OPTIONAL {
							GRAPH <${this.sparqlHelper.graphs_uri.groups}> {
								?wall_owner type:id ?wall_owner_id ;
								groups:name ?wall_owner_name .
							}
						}
					}
				}
				OPTIONAL {
					GRAPH <${this.sparqlHelper.graphs_uri.posts}> {
						?post posts:wall ?wall ;
						type:id ?id ;
						type:time ?time ;
						type:owner ?owner ;
						type:mongo_id ?mongo_id .
						OPTIONAL {
							GRAPH <${this.sparqlHelper.graphs_uri.users}> {
								?owner type:id ?owner_id ;
								users:name ?owner_name .
							}
						}
					}
				}
            } ORDER BY DESC(?time) LIMIT 30 OFFSET ${offsetLevel * 30}`;
		return this.query(sparql, 'query');
	}

    //public getSubscribers(user_id: string): Promise<any> {
    //    let sparql =
    //        `${this.sparqlHelper.prefixes}
    //    SELECT ?subscriber_id
    //    FROM <${this.sparqlHelper.graphs_uri.users}> 
    //    {
    //      ?subscriber users:subscribe users:user_${user_id} .
    //      ?subscriber users:id ?subscriber_id .         
    //    }`;
    //    return this.query(sparql, 'query');
    //}

    //public getFriendsCount(user_id: string): Promise<any> {
    //    let sparql =
    //        `${this.sparqlHelper.prefixes}
    //    SELECT (COUNT(?friend) as ?count)
    //    FROM <${this.sparqlHelper.graphs_uri.users}>
    //    {
    //      users:user_${user_id} users:subscribe ?friend .
    //      ?friend users:subscribe users:user_${user_id} .          
    //    }`;
    //    return this.query(sparql, 'query');
    //}

    //public getSubscribersCount(user_id: string): Promise<any> {
    //    let sparql =
    //        `${this.sparqlHelper.prefixes}
    //    SELECT (COUNT(?subscriber) as ?count)
    //    FROM <${this.sparqlHelper.graphs_uri.users}> 
    //    {
    //      ?subscriber users:subscribe users:user_${user_id} .          
    //    }`;
    //    return this.query(sparql, 'query');
    //}


    //public getNews(user_id, offsetLevel): Promise<any> {
    //    const EVERY_COUNT = 30;
    //    let sparql =
    //        `${this.sparqlHelper.prefixes}
    //    SELECT ?post
    //    FROM <${this.sparqlHelper.graphs_uri.users}> 
    //    WHERE
    //    {
    //      users:user_${user_id} users:subscribe ?wall . 
    //      OPTIONAL {
    //        GRAPH <${this.sparqlHelper.graphs_uri.posts}> {
    //          ?post posts:wall ?wall .
    //          ?post posts:time ?post_time .
    //          ?post posts:id ?post_id .
    //          ?post posts:text ?post_text .
    //        }
    //      }
    //    } 
    //    ORDER BY ?post_time
    //    LIMIT ${EVERY_COUNT}
    //    OFFSET ${offsetLevel * EVERY_COUNT}`;
    //    return this.query(sparql, 'query');
    //}


    public getPrivateInfoById(id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?property ?value
			FROM <${this.sparqlHelper.graphs_uri.users}> 
			{
			  users:${'user_' + id} ?property ?value .            
			}`;
        return this.query(sparql, 'query');
    }
    public getPrivateInfo(phone, token: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?id ?phone ?token ?name
			FROM <${this.sparqlHelper.graphs_uri.users}> 
			WHERE
			{
			  ?user type:token "${token}" ;
				users:phone "${phone}" ;
				type:id ?id ;
				type:token ?token ;
				users:phone ?phone ;
				OPTIONAL {
				  ?user users:name ?name 
				}
			}`;
        return this.query(sparql, 'query');
    }

    public getProperty(user_id, property): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?${property}
			FROM <${this.sparqlHelper.graphs_uri.users}> 
			{ users:${'user_' + user_id} users:${property} ?${property} }`;
        return this.query(sparql, 'query');
    }

    public subscribeUser(user_id, object): Promise<any> {
        /*return this.pushProperties({
            graph: `${this.sparqlHelper.graphs_uri.users}`,
            vertex: {
                prefix: 'users',
                fid: `user_${user_id}`
            },
            props: [
                {
                    prefix: 'type',
                    subscribe: `${object_fid}`
                }
            ]
        });*/
		let sparql =
			`${this.sparqlHelper.prefixes}
            INSERT DATA
            {
              GRAPH <${this.sparqlHelper.graphs_uri.users}>
              {
                users:user_${user_id} type:subscribe ${object} 
              }}`;
		return this.query(sparql, 'update');
    }

    public describeUser(user_id, object_fid): Promise<any> {
        return this.deleteProperty({
            graph: `${this.sparqlHelper.graphs_uri.users}`,
            value: object_fid,
            vertex: {
                prefix: 'users',
                fid: `user_${user_id}`
            },
            edge: {
                prefix: 'type',
                property: 'subscribe'
            }
        });
    }

    public addValueToProperty(user_id, property, value: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			WITH <${this.sparqlHelper.graphs_uri.users}>
			DELETE { users:user_${user_id} users:${property} ?before }
			INSERT { GRAPH <${this.sparqlHelper.graphs_uri.users}#> 
			{ users:user_${user_id} users:${property} ?after } }
			WHERE {
			  users:user_${user_id} users:${property} ?before .
			  BIND( (?before + ${value}) AS ?after ) }`;
        return this.query(sparql, 'update');
    }

    public addInfo(userId, userData) {
        console.log('User data in provider: ');
        console.log(userData);
        let props = [];
        for (let key in userData) {
            let obj = {};
            obj[key] = userData[key];
            obj['prefix'] = key === 'id' || key === 'token' ? 'type' : 'users';
            props.push(obj);
        }
		return this.pushProperties({
			graph: `${this.sparqlHelper.graphs_uri.users}`,
            vertex: {
                prefix: 'users',
                fid: `user_${userId}`
            },
            props: props
        });
    }

    public replaceInfo(userId, edgeName, value) {
        return this.replaceProperty({
			graph: `${this.sparqlHelper.graphs_uri.users}`,
            value: value,
            vertex: {
                prefix: 'users',
                fid: `user_${userId}`
            },
            edge: {
                prefix: edgeName == 'id' || edgeName == 'token' || edgeName == 'subscribe' ? 'type' : 'users',
                property: edgeName
            }
        })
    }


    public deletePropertiesByKey(id, property: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        WITH <${this.base_url}/${this.dataset}>
        DELETE { users:user_${id} users:${property} ?value }
        WHERE  { users:user_${id} users:${property} ?value }`;
        return this.query(sparql, 'update');
    }

    public checkExist(phone, token: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        ASK {
         GRAPH <${this.base_url}/${this.dataset}>
        { ?user users:phone "${phone}"; type:token "${token}" } }`;
        return this.query(sparql, 'query');
    }

    public getUserByPhone(phone): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?phone ?token
        FROM <${this.base_url}/${this.dataset}>
        WHERE
        {
          ?user users:phone "${phone}" ;
            type:token ?token ;
            users:phone ?phone .
        } LIMIT 1`;
        return this.query(sparql, 'query');
    }

}
