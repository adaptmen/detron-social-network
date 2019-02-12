import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable()
export class HttpService {
	constructor(private http: HttpClient) { }

	public get(url, options?) {
		console.log('get==>', url);
		let subj = new Subject();
		this.http
		.get(url, options || {})
		.subscribe((data) => {
			console.log('<==get', url, data);
			subj.next(data);
		});
		return subj;
	}

	public post(url, body, options?) {
		console.log('post==>', url, body);
		let subj = new Subject();
		this.http
		.post(url, body, options || {})
		.subscribe((data) => {
			console.log('<==post', url, data);
			subj.next(data);
		});
		return subj;
	}

}
