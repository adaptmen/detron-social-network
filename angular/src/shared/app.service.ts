import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocketProvider } from '@providers/socket.provider';
import SocketTypes from '../app/SocketTypes';


@Injectable()
export class AppService implements OnInit {

	constructor(private socketProvider: SocketProvider) {
		this.socketProvider.onConnect.subscribe(() => {
			this.onConnect.next();
			this.socketProvider.on(SocketTypes.APP_INIT).subscribe((app_data) => {
				this.user = app_data['user'];
				this.chats = app_data['chats'];
				this.app_init.next(app_data);
			});
		});
	}

	public current_url: any;
	public friends: any;
	public history_tabs: any;

	public onConnect = new Subject();

	public app_init = new Subject();

	public new_news = new Subject();
	public new_world_news = new Subject();
	public new_message = new Subject();
	public new_notify = new Subject();

	public mail_notify_count = 0;
	public chats_notifies = {};
	public news_notifies = {};
	public news_world_notify_count = 0;

	public user = { id: '' };
	public chats = {};

	public getUserId = () => this.user.id;

	ngOnInit() {
		
	}

}