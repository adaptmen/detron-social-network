import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpService } from '@shared/http.service';
import { UploadService } from '@shared/upload.service';
import { Subject } from 'rxjs';
import SocketTypes from '@app/SocketTypes';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.sass']
})
export class UploadComponent implements OnInit {

	constructor(public httpService: HttpService, public uploadService: UploadService) { }

	@Input() object_fid = "";
    @Output() close = new EventEmitter<any>();

	public preview: any;
	public attach_token = '';
	public status_string = '';

	ngOnInit() {
	}

	cancel() {
        this.close.emit(null);
    }

    attach() {
    	let subj = new Subject();
    	this
    	.uploadService
    	.attach(this.attach_token)
    	.subscribe((ans) => {
    		if (ans == SocketTypes.SUCCESS) {
    			this.cancel();
    		}
    		else {
    			this.status_string = 'Произошла ошибка. Попробуйте заново';
    		}
    	});
    	return subj;
    }

	onChange(event) {

		let fileList: FileList = event.target.files;
		if(fileList.length > 0) {
			let file: File = fileList[0];

		    this
		    .uploadService
		    .uploadFile(file, this.object_fid)
		    .subscribe((ans: any) => {
		    	console.log('[ UploadComponent ]', ans);
		    	if (ans === SocketTypes.DENIED) {
		    		this.status_string = 'Доступ запрещён. Вы не можете загружать файлы на эту стену';
		    	}
		    	if (ans === SocketTypes.ERROR) {
		    		this.status_string = 'Произошла ошибка, попробуйте позже';
		    	}
		    	else {
		    		if (ans.ext) {
		    			this.preview = {};
		    			this.preview.file_url = ans.file_url;
		    			this.preview.name = ans.name;
		    			this.preview.ext = ans.ext;
		    			this.attach_token = ans.attach_token;
		    		}
		    	}
		    });
    	}

	}

}
