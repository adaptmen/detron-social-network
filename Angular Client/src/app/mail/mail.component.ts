import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '@shared/app.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.sass']
})
export class MailComponent implements OnInit {

	constructor(public appService: AppService, public router: Router) { }

	ngOnInit() {
		this.appService.app_init.subscribe((app_data: any) => {
			if (app_data.chats.length != 0) {
				this.router.navigate([`/${app_data.chats.keys()[0]}`]);
			}
		});
	}

}
