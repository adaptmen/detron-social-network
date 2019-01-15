import DataProvider from "./DataProvider";
import MongoContext from "../core/MongoContext";
import Message from "../models/Message";


export default class MessageDataProvider extends DataProvider {

    constructor() {
        super();
    }

    /*public insertMessage(chat_id, msg_id, maker_id, content, time) {
        return this.mongoContext.updateOne('chats', {
            props: {
                chat_id: chat_id
            },
            agregates: {
                '$push': {
                    'messages': {
                        '$each': [
                            {
                                msg_id,
                                maker_id,
                                content,
                                time
                            }
                        ]
                    }
                }
            }
        })
    }*/

    /*public getAllMessaggesForChat(chat_id) {
        return this.mongoContext.find('chats', {
            props: {
                chat_id: chat_id
            },
            agregates: {
                'messages': 1,
                '_id': 0
            }
        })
    }*/

    public addMessage(message: Message): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
            INSERT DATA
            {
              GRAPH <${this.sparqlHelper.graphs_uri.messages}>
              {
                messages:msg_${message.id} type:id "${message.id}" ;
                messages:maker users:user_${message.maker_id} ;
                type:time "${message.time}" ;
                messages:chat chats:chat_${message.chat_id};
                messages:mongo_id "${message.mongo_id}"
              }}`;
        return this.query(sparql, 'update');
    }

    public getMessageById(msg_id, chat_id: string) {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?id ?time ?maker_id ?maker_name ?chat_id ?mongo_id
        FROM <${this.sparqlHelper.graphs_uri.messages}>
        {
			messages:msg_${msg_id} type:id ?id ;
			type:id ?id ;
			messages:chat ?chat ;
			messages:mongo_id ?mongo_id ;
			messages:maker ?maker .
			OPTIONAL {
				GRAPH <${this.sparqlHelper.graphs_uri.users}> {
					?maker type:id ?maker_id;
					users:name ?maker_name;
				}
			}
			OPTIONAL {
				GRAPH <${this.sparqlHelper.graphs_uri.chats}> {
					?chat type:id ?chat_id .
				}
			}
        }`;
        console.log(sparql);
        return this.query(sparql, 'query');
    }



    public getMessagesByUser(user_id: string) {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?chat_id ?text ?maker_id ?time
        FROM <${this.sparqlHelper.graphs_uri.messages}>
        WHERE { {
          ?user users:id "${user_id}" .
          ?user users:subscribe ?chat .
          ?chat chats:id ?chat . }
          UNION {
            GRAPH ?chat {
              ?chat chats:id ?chat_id .
              ?msg messages:text ?msg_id .
              ?msg messages:time ?time .
              ?msg messages:maker ?maker .
              ?maker users:id ?maker_id }}}`;
        return this.query(sparql, 'query');
    }

	public getMessagesByChat(chat_id, offsetLevel): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
			SELECT ?id ?time ?maker_id ?maker_name ?mongo_id 
			{
				GRAPH <${this.sparqlHelper.graphs_uri.messages}> {
					?message messages:chat chats:chat_${chat_id} ;
					messages:id ?id ;
					messages:time ?time ;
					messages:text ?content ;
					messages:maker ?maker .
				}
				GRAPH <${this.sparqlHelper.graphs_uri.messages}> {
					?maker type:id ?maker_id ;
					users:name ?maker_name .
				}
			}
			ORDER BY ?time
			LIMIT 30
			OFFSET ${offsetLevel * 30}`;
        return this.query(sparql, 'query');
    }

    public updateMessage(chat_id, msg_id, text: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        WITH <${this.sparqlHelper.graphs_uri.messages}>
        DELETE { messages:msg_${msg_id} messages:text ?value }
        WHERE  { messages:msg_${msg_id} messages:text ?value };
        INSERT DATA { 
          GRAPH <${this.sparqlHelper.graphs_uri.messages}>
          { messages:msg_${msg_id} messages:text "${text}" }
        }`;
        return this.query(sparql, 'update');
    }

    public deleteMessage(chart_id, msg_id: string): Promise<any> {
        let sparql =
            `${this.sparqlHelper.prefixes}
        DROP <${this.sparqlHelper.graphs_uri.messages}#msg_${msg_id}>`
        return this.query(sparql, 'update');
    }

}
