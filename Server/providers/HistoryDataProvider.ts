import DataProvider from "./DataProvider";
import HistoryEvents from '../core/HistoryEventTypes';
import HistoryEvent from "../models/HistoryEvent";

export default class HistoryDataProvider extends DataProvider {

    constructor() {
        super();
    }

    public addEvent(event: HistoryEvent) {
        let event_id = this.securityHelper.generateId();
        let sparql =
            `${this.sparqlHelper.prefixes} 
                    INSERT DATA {
                        GRAPH <${this.sparqlHelper.graphs_uri.history}>
                        { events:event_${event.id} type:id "${event.id}";
                            events:subject ${event.subject} ;
                            events:object ${event.object} ;
                            events:type "${event.type}" ;
                            type:role "event" ;
                            type:time "${event.time}" } }`;
        return this.query(sparql, 'update')
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