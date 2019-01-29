import DataProvider from "./DataProvider";
import MongoContext from "../core/MongoContext";
import SqlContext from "../core/SqlContext";

export default class MessageDataProvider extends DataProvider {

    private sqlContext;

    constructor(sqlContext: SqlContext) {
        super();
        this.sqlContext = sqlContext;
    }

    public addMessage(chat_id, maker_id, content, time): Promise<any> {
        return new Promise((resolve, reject) => {
            let msg_id = this.securityHelper.generateId();

            this
            .sqlContext
            .query(`USE chats INSERT INTO \`chat_${chat_id}\`
             (id, maker_id, content, time)
              VALUES ('${msg_id}', '${maker_id}', '${content}', '${time}')`)
            .then(() => {
                let sparql =
                `${this.sparqlHelper.prefixes}
                INSERT DATA
                {
                  GRAPH <${this.sparqlHelper.graphs_uri.messages}>
                  {
                    messages:msg_${msg_id} type:id "${msg_id}" ;
                    messages:maker users:user_${maker_id} ;
                    type:time "${time}" ;
                    messages:chat chats:chat_${chat_id}
                  }}`;
                this.query(sparql, 'update').then(() => { resolve() });
            });
        });
    }

    public getChats(user_id) {
        let sparql =
            `${this.sparqlHelper.prefixes}
            SELECT ?chat_id ?friend_id
            {
                GRAPH <${this.sparqlHelper.graphs_uri.users}>  {
                    users:user_${user_id} type:subscribe ?chat .
                    ?friend type:subscribe ?chat;
                    type:id ?friend_id.
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

    public createChat(chat_id, user_1_id, user_2_id) {
        return new Promise((resolve, reject) => {
            this
            .sqlContext
            .query(`USE chats CREATE TABLE \`chat_${chat_id}\``)
            .then((res) => {
                this
                .sqlContext
                .query(`USE containers INSERT INTO \`user_${user_1_id}\`
                    (type, object_id, last_message)
                    VALUES ('chat', '${chat_id}', NULL)`)
                .then((res) => {
                    this
                    .sqlContext
                    .query(`USE containers INSERT INTO \`user_${user_2_id}\`
                        (type, object_id, last_data)
                        VALUES ('chat', '${chat_id}', NULL)`)
                    .then((res) => {
                        let sparql =
                        `${this.sparqlHelper.prefixes}
                        INSERT DATA { 
                            GRAPH <${this.sparqlHelper.graphs_uri.chats}> 
                            { chats:chat_${chat_id} type:id "${chat_id}" ;
                                chats:privacy "private" ;
                                type:role "chat" . } }`;
                        this.query(sparql, 'update')
                        .then(() => {
                            resolve();
                        })
                    });
                });
            });
        });
    }

	public getMessagesByChat(chat_id, offsetLevel): Promise<any> {
        return this
        .sqlContext
        .query(`USE \`chats\` SELECT id, maker_id, content, time
         FROM \`chat_${chat_id}\` LIMIT 30 OFFSET ${30 * offsetLevel}`);
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
