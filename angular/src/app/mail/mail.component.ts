import { Component, OnInit } from '@angular/core';
import Chat from '../../models/Chat';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.sass']
})
export class MailComponent implements OnInit {

	constructor(private appService: AppService) { }

	public chats: Chat[] = [];

	ngOnInit() {
		this.appService.app_init.subscribe((app_data) => {
			this.chats = app_data.chats;
		});
	}

}
