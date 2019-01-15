

export default class TimeEvent {

    public ban: number;
    public last: number;
    public count: number;

    constructor(_count: number, _last: number, _ban: number) {
        this.ban = _ban;
        this.last = _last;
        this.count = _count;
    }

}