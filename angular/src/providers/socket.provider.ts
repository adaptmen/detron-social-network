import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as io from 'socket.io-client';
import env from '@environment/environment';
import { CookieService } from 'ngx-cookie-service';
import SocketTypes from '../app/SocketTypes';
import { SecurityHelper } from '@helpers/security.helper';

@Injectable()
export class SocketProvider implements OnInit {

    private host = `https://${env.api.host}:443`;
    private socket_url: string;

    public inited = false;
    public socket: any;

    public onConnect = new Subject();

    public emit: (event_name, message) => Subject<any>;
    public on: (event_name) => Subject<any>;

    constructor(private cookieService: CookieService,
     private securityHelper: SecurityHelper) {
    	setTimeout(() => { this.initConnection()}, 100);
    }

    ngOnInit() {
    }

    public sendRequest;

    public initConnection() {

        this.socket_url = `${this.host}`;

        console.log(this.socket_url);

        this.socket = io(this.socket_url);

        this.socket.on('connect', () => {
	        this.connect();
	        this.onConnect.next();
	    });

        this.on = (event_name): Subject<any> => {
            let subj = new Subject<any>();
            this.socket.on(event_name, (data) => {
                subj.next(data);
                if (!env.production) console.log('<- ' + event_name, data);
            });
            return subj;
        };

        this.emit = (event_name: string, message: any): Subject<any> => {
            let subj = new Subject<any>();
            if (!env.production) console.log('-> ', event_name, message);
            this.socket.emit(event_name, message, function (data) {
                subj.next(data);
            });
            return subj;
        };

        this.sendRequest = (type, msg) => {
            let subj = new Subject();
            let id = this.securityHelper.generateRequestId();
            if (!env.production) console.log('~~> ', type, msg);
            this.socket.emit(SocketTypes.SOCKET_REQUEST, {
                id, type, msg
            });
            this.socket.on(`${type}_${id}`, (ans) => {
                subj.next(ans);
                this.socket.off(`${type}_${id}`);
                if (!env.production) console.log('<~~ ', type, ans);
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