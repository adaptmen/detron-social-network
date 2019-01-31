import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '@shared/app.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.sass']
})
export class MailComponent implements OnInit {

	constructor(private appService: AppService, private router: Router) { }

	ngOnInit() {
		this.appService.app_init.subscribe((app_data) => {
			this.router.navigate([`/${app_data.chats.keys()[0]}`]);
		});
	}

}
