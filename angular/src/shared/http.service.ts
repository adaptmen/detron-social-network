import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { Subject } from 'rxjs';

@Injectable()
export class HttpService {
	constructor(private http: HttpClient) { }

	public get(url, options?) {
		console.log('==>', url);
		return this.http.get(url, options || {});
	}

	public post(url, body, options?) {
		console.log('<==');
		return this.http.post(url, body, options || {});
	}

}
