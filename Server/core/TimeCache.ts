import TimeStatistic from "../models/TimeEvent";
import TimeEvents from "./TimeEvents";


export default class TimeCache {

    public TIME_ACTION_INTERVAL = 500;
    public TIME_COUNT_LIMIT = 5;
    public TIME_BAN = 2 * 60 * 1000;

    public time_store: TimeStore = new TimeStore();

    constructor() { }

    public addPoint(user_id): TimeEvents {
        this.time_store[user_id].addStatistic(user_id);

        if (!this.time_store.checkBanned(user_id)) {
            if (this.time_store.getStatistic(user_id).count >= this.TIME_COUNT_LIMIT) {
                this.time_store.getStatistic(user_id).ban = Date.now() + this.TIME_BAN;
                return TimeEvents.BUNNED;
            }

            if (Date.now() <= this.time_store[user_id].last + this.TIME_ACTION_INTERVAL) {
                this.time_store.getStatistic(user_id).count++;
                return TimeEvents.ALLOW;
            }
            else {
                this.time_store[user_id].count = 1;
                return TimeEvents.ALLOW;
            }
        }
        else {
            return TimeEvents.BUNNED;
        }
    }

    public checkBanned(user_id) {
        return this.time_store.checkBanned(user_id);
    }

    public getBunTime(user_id) {
        return this.time_store[user_id]
    }

}

class TimeStore {

    constructor() { }

    public store = {};

    public addStatistic(user_id) {
        if (!this.store[user_id]) {
            this.store[user_id] = new TimeStatistic(1, Date.now(), Date.now() - 1);
        }
    }

    public getStatistic(user_id): TimeStatistic {
        return this.store[user_id];
    }

    public checkBanned(user_id): boolean {
        return this.store[user_id].ban >= Date.now();
    }

    public getBunTime(user_id) {
        return this.store[user_id].ban - Date.now();
    }

}
