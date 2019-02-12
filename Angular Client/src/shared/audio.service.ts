import { Injectable } from '@angular/core';
import { AppService } from '@shared/app.service';
import { Subject } from 'rxjs';

@Injectable()
export class AudioService {
	constructor(private appService: AppService) { }

	set_url = new Subject();

	setUrl(url) {
		this.set_url.next(url);
	}

}