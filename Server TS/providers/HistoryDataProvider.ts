import DataProvider from "./DataProvider";
import SqlContext from "../core/SqlContext";

export default class HistoryDataProvider extends DataProvider {

    public sqlContext;

    constructor(sqlContext: SqlContext) {
        super();
        this.sqlContext = sqlContext;
    }

    public addEvent(type, subject, object, time) {
        let event_id = this.securityHelper.generateId();
        return new Promise((resolve, reject) => {
            this.sqlContext.query(`USE history
             INSERT INTO \`${this.sqlContext.current_history_table}\` (id, type, subject, object, time)
              VALUES ('${event_id}', '${type}', '${subject}', '${object}', '${time}')`)
            .then(() => {
                let sparql =
                `${this.sparqlHelper.prefixes} 
                        INSERT DATA {
                            GRAPH <${this.sparqlHelper.graphs_uri.history}>
                            { events:event_${event_id} type:id "${event_id}";
                                events:subject ${subject} ;
                                events:object ${object} ;
                                events:type "${type}" ;
                                type:role "event" ;
                                type:time "${time}" } }`;
                this.query(sparql, 'update').then(() => { resolve() });
            });
        });
    }

    public getAllHistory() {
        let sparql =
            `${this.sparqlHelper.prefixes} 
                    SELECT ?event_id ?subject_id ?object_id ?event_type ?time ?content
                    FROM <${this.sparqlHelper.graphs_uri.history}> 
                    {   
                        ?event type:id ?event_id ;
                        events:type ?event_type ;
                        type:time ?time ;
                        events:content ?content .
                        ?event events:subject ?subject .
                        ?event events:object ?object .
                        OPTIONAL {
                            GRAPH <${this.sparqlHelper.graphs_uri.users}}> 
                            {
                                ?subject type:id ?subject_id .
                                ?object type:id ?object_id .
                            }
                        }
                        OPTIONAL {
                            GRAPH <${this.sparqlHelper.graphs_uri.chats}}> 
                            {
                                ?object type:id ?object_id .
                            }
                        }
                        OPTIONAL {
                            GRAPH <${this.sparqlHelper.graphs_uri.walls}}>
                            {
                                ?object type:id ?object_id .
                            }
                        }
                        OPTIONAL {
                            GRAPH <${this.sparqlHelper.graphs_uri.posts}}>
                            {
                                ?object type:id ?object_id .
                            }
                        }}`;
        return this.query(sparql, 'query')
    }

}