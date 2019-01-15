import RequestTypes from "./RequestTypes";

export default class Answer {

    public code: RequestTypes;
    public answer: any;

    constructor(code, answer) {
        this.code = code;
        this.answer = answer;
    }

}