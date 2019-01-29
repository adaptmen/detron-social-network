import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { Subject } from 'rxjs';

@Injectable()
export class HttpService {
	constructor(private http: HttpClient) { }

	public get(url, options?) {
		return this.http.get(url, options || {});
	}

	public post(url, body, options?) {
		return this.http.post(url, body, options || {});
	}

}
