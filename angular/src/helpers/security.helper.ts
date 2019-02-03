import { Injectable, OnInit } from '@angular/core';


@Injectable()
export class SecurityHelper implements OnInit {

	constructor() {}

	ngOnInit() {
			
	}

	public generateRequestId() {
		return String(Date.now() / 14);
	}

}