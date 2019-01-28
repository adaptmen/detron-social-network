import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocketProvider } from '@providers/socket.provider';
import RequestTypes from '../app/RequestTypes';

export default class AppService implements OnInit {

	constructor(private socketProvider: SocketProvider) {

	}

	public current_url = '';

	public app_init = new Subject();

	public new_news = new Subject();
	public new_world_news = new Subject();
	public new_message = new Subject();
	public new_notify = new Subject();

	public mail_notify_count = 0;
	public chats_notifies = {};
	public news_notifies = {};
	public news_world_notify_count = 0;

	ngOnInit() {
		this.socketProvider.on(RequestTypes.APP_INIT, (app_data) => {
			this.app_init.next(app_data);
		});
		
	}

}