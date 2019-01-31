import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as io from 'socket.io-client';
import env from '../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';
import SocketTypes from '../app/SocketTypes';

@Injectable()
export default class SocketProvider implements OnInit {

    private host = `http://${env.server.url.host}:${env.server.url.port}`;
    private socket_url: string;

    public inited = false;
    public socket: any;

    public emit: (event_name, message) => Subject<any>;
    public on: (event_name) => Subject<any>;

    constructor(private cookieService: CookieService) {
    	this.initConnection();
    }

    ngOnInit() {

    }

    public sendRequest;

    public initConnection() {

        this.socket_url = `${this.host}?token=${this.cookieService.get('token')}`;

        console.log(this.socket_url);

        this.socket = io(this.socket_url);

        this.socket.on('connect', () => {
	        this.connect();
	        this.inited = true;
	    });

        this.on = (event_name): Subject<any> => {
            let subj = new Subject<any>();
            //this.socket.off(event_name);
            this.socket.once(event_name, (data) => {
                subj.next(data);
                console.log('Server event: ' + event_name, data);
            });
            return subj;
        };

        this.emit = (event_name: string, message: any): Subject<any> => {
            let subj = new Subject<any>();
            console.log('Emit event: ', { event_name, message });
            this.socket.emit(event_name, message, function (data) {
                subj.next(data);
            });
            return subj;
        };

        this.sendRequest = (type, msg) => {
            let subj = new Subject();
            let id = this.securityHelper.generateRequestId();
            this.socket.emit(SocketTypes.SOCKET_REQUEST, {
                id, type, msg
            });
            this.socket.on(`${type}_${id}`, (ans) => {
                subj.next(ans);
                this.socket.off(`${type}_${id}`);
            });
            return subj;
        };

        this.socket.on('disconnect', () => {
            this.inited = false;
            this.disconnect();
        });

        this.socket.on('error', (error: any) => {
            console.log(error);
        });
    }

    public connect() {
        this.socket.connect();
        console.log('Соединение установлено');
    }

    public disconnect() {
        this.socket.disconnect();
        console.log('Соединение прервано');
    }

}