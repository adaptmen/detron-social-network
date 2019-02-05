import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { SocketProvider } from '@providers/socket.provider';
import { Subject } from 'rxjs';
import SocketTypes from '@app/SocketTypes';
import env from '@environment/environment';

@Injectable()
export class UploadService {

	constructor(private httpService: HttpService, private socketProvider: SocketProvider) { }

	public UPLOAD_URL = `/disk/upload`;

	public getAccess(object_fid) {
		let subj = new Subject();
		this
		.socketProvider
		.sendRequest(SocketTypes.GET_UPLOAD_TOKEN, { object_fid })
		.subscribe((ans) => {
			if (ans === SocketTypes.DENIED) {
				subj.next(SocketTypes.DENIED);
			}
			else {
				subj.next(ans);
			}
		});
		return subj;
	}

	public uploadFile(file, object_fid) {
		let formData: FormData = new FormData();
		formData.append('uploadFile', file, file.name);

		let headers = new Headers();
		headers.append('Content-Type', 'multipart/form-data');
		headers.append('Accept', 'application/json');
		let options = { headers: headers };

		let subj = new Subject();

		this
		.getAccess(object_fid)
		.subscribe((ans) => {
			if (ans == SocketTypes.DENIED) subj.next(SocketTypes.DENIED);

			this
			.httpService
			.post(`${this.UPLOAD_URL}/${ans}`, formData, options)
		    .subscribe(
		        (data) => {
		        	subj.next(data);
		        },
		        (error) => {
		        	subj.next(SocketTypes.ERROR)
		        }
		    )
		});
	    return subj;
	}

}