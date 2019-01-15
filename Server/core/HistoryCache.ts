import HistoryEvent from "../models/HistoryEvent";


export default class HistoryCache {

    constructor() { }

    public store = {};

    public addEvent(event: HistoryEvent) {
        this.store[event.id] = event;
    }

    public getEvent(event_id): HistoryEvent {
        return this.store[event_id];
    }

}