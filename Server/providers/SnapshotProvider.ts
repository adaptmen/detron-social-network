import DataProvider from "./DataProvider";
import HistoryDataProvider from "./HistoryDataProvider";


export default class SnapshotProvider extends DataProvider {

    private historyProvider: HistoryDataProvider;

    constructor() {
        super();
        this.historyProvider = new HistoryDataProvider();
    }

    public getUsers() {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?id ?name ?token ?phone ?wall_id
        {
			GRAPH <${this.sparqlHelper.graphs_uri.users}> {
				?user users:name ?name; 
				type:id ?id ;
				type:token ?token ;
				users:phone ?phone .
			}
			OPTIONAL {
				GRAPH <${this.sparqlHelper.graphs_uri.walls}> {
					?wall walls:attacher ?user; type:id ?wall_id;
				}
			}
        }`;
        return this.query(sparql, 'query');
    }

    /*public getMessages() {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?id ?maker_id ?time ?chat_id ?content
        FROM <${this.base_url}/${this.dataset}> 
        { ?msg messages:id ?id; 
               messages:maker ?maker ;
               messages:time ?time ;
               messages:text ?content ;
               messages:chat ?chat .
           ?maker type:id ?maker_id.
           ?chat type:id ?chat_id.
        } ORDER BY ?time`;
        return this.query(sparql, 'query');
    }*/

    /*public getChats() {
        let sparql =
            `${this.sparqlHelper.prefixes}
        SELECT ?user_id ?chat_id ?privacy
        FROM <${this.sparqlHelper.graphs_uri.users}> 
        { ?user type:subscribe ?chat ;
                type:id ?user_id .
          ?chat type:id ?chat_id ;
                chats:privacy ?privacy .
        }`;
        return this.query(sparql, 'query');
    }*/

    public getHistory() {
        return this.historyProvider.getAllHistory();
    }

}
