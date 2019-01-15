import DataProvider from "./DataProvider";
import MongoContext from "../core/MongoContext";



export default class ChatDataProvider extends DataProvider {

	constructor() {
		super();
	}

    /*public addChat(chat_id, owner_id, privacy: string): Promise<any> {
        return this
            .mongoContext
            .insertOne('chats', {
                chat_id: chat_id,
                messages: []
            })
            .then((inserted_info: any) => {
                let sparql =
                    `${this.sparqlHelper.prefixes}
                INSERT DATA { 
                  GRAPH <${this.sparqlHelper.graphs_uri.chats}> 
                    { chats:chat_${chat_id} type:id "${chat_id}" ;
                      type:owner users:user_${owner_id} ;
                      type:mongo_id "${inserted_info.insertedId}" ;
                      chats:privacy "${privacy}" } }`;
                return this.query(sparql, 'update');
            })
    }*/

	public addChat(chat_id): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
			INSERT DATA { 
				GRAPH <${this.sparqlHelper.graphs_uri.chats}> 
				{ chats:chat_${chat_id} type:id "${chat_id}" ;
					chats:privacy "private" ;
					type:role "chat" . } }`;
		return this.query(sparql, 'update');
	}

	public checkChat(user_id, companion_id): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
			ASK WHERE
			{
				GRAPH <${this.sparqlHelper.graphs_uri.chats}>
				{ 
					users:user_${user_id} type:subscribe ?chat .
					users:user_${companion_id} type:subscribe ?chat .
				}
			}`;
		return this.query(sparql, 'query');
	}

	public getChatId(user_id, companion_id): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
			SELECT ?chat_id
			WHERE
			{
				GRAPH <${this.sparqlHelper.graphs_uri.chats}>
				{ 
					users:user_${user_id} type:subscribe ?chat .
					users:user_${companion_id} type:subscribe ?chat .
				}
				GRAPH <${this.sparqlHelper.graphs_uri.chats}> {
					?chat type:id ?chat_id .
				}
			}`;
		return this.query(sparql, 'query');
	}

    /*public addPersonalChat(chat_id, owner_id, companion_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			INSERT DATA { 
			  GRAPH <${this.sparqlHelper.graphs_uri.chats}>
				{
					chats:chat_${chat_id} type:id "${chat_id}" ;
					chats:owner users:user_${owner_id} ;
					type:role "chat" ;
					chats:personal "private" .
					users:user_${owner_id} type:subscribe chats:chat_${chat_id} .
					users:user_${companion_id} type:subscribe chats:chat_${chat_id} .
				}
			}`;
        return this.query(sparql, 'update');
    }*/

	public getCounts(chat_id: string): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
        SELECT ?user ?count
        FROM <${this.sparqlHelper.graphs_uri.chats}>
        { ?user users:count ?count }`;
		return this.query(sparql, 'query');
	}

	public incrementCounts(chat_id: string): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
        WITH <${this.sparqlHelper.graphs_uri.chats}>
        DELETE { ?user users:count ?precount }
        INSERT { GRAPH <${this.base_url}/${this.dataset}> { ?user users:count ?updated } }
        WHERE {
            ?user users:count ?precount .
            BIND( (?precount + 1) AS ?updated ) }`;
		return this.query(sparql, 'update');
	}

	/*public clearCount(user_id, chat_id: string): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
        WITH <${this.sparqlHelper.graphs_uri.chats}>
        DELETE { users:user_${user_id} users:count ?precount }
        INSERT { GRAPH <${this.base_url}/${this.dataset}>  { users:user_${user_id} users:count ?updated } }
        WHERE {
            users:user_${user_id} users:count ?precount .
            BIND( (?precount - ?precount) AS ?updated ) }`;
		return this.query(sparql, 'update');
	}*/

	/*public getPersonalChatInfo(chat_id, user_id): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
        SELECT ?id ?companion_id ?companion_name
        FROM <${this.sparqlHelper.graphs_uri.chats}>
        { chats:chat_${chat_id} type:id ?id .
          ?owner type:id "${user_id}" .
          ?companion type:subscribe chats:chat_${chat_id} ;
           type:id ?companion_id ;
           users:name ?companion_name .
        }`;
		return this.query(sparql, 'query');
	}*/

	public getProperty(chat_id, property): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
        SELECT ?${property}
        FROM <${this.sparqlHelper.graphs_uri.chats}>
        { chats:chat_${chat_id} chats:${property} ?${property} }`;
		return this.query(sparql, 'query');
	}

	public pushProperty(chat_id, property, value: string): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes} 
        INSERT DATA { 
          GRAPH <${this.sparqlHelper.graphs_uri.chats}>
          { chats:chat_${chat_id} ${property} "${value}" }
        }`;
		return this.query(sparql, 'update');
	}

	public addValueToProperty(chat_id, property, value: string): Promise<any> {
		let sparql =
			`${this.sparqlHelper.prefixes}
			WITH <${this.sparqlHelper.graphs_uri.chats}>
			DELETE { chats:chat_${chat_id} chats:${property} ?before }
			INSERT { GRAPH <${this.base_url}/${this.dataset}> { chats:chat_${chat_id} chats:${property} ?after } }
			WHERE {
			  chats:chat_${chat_id} chats:${property} ?before .
			  BIND( (?before + ${value}) AS ?after ) }`;
		return this.query(sparql, 'update');
	}



	public checkPersonalChat(userId, companionId) {
		let sparql =
			`${this.sparqlHelper.prefixes}
		  SELECT ?id
		  FROM <${this.sparqlHelper.graphs_uri.chats}>
		  { 
			?user type:id "${userId}" .
			?user type:subscribe ?chat .
			?companion type:id "${companionId}" .
			?companion type:subscribe ?chat .
			?chat chats:personal "private" ;
				  type:id ?id .
		  } `;
		return this.query(sparql, 'query');
	}

}
