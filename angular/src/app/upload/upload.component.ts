import { Component, OnInit } from '@angular/core';
import { HttpService } from '@shared/http.service';
import { UploadService } from '@shared/upload.service';
import SocketTypes from '@app/SocketTypes';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.sass']
})
export class UploadComponent implements OnInit {

	constructor(public httpService: HttpService, public uploadService: UploadService) { }

	public preview = {};

	public object_fid = '';

	ngOnInit() {
	}

	onChange(event) {

		let fileList: FileList = event.target.files;
		if(fileList.length > 0) {
			let file: File = fileList[0];

		    this
		    .uploadService
		    .uploadFile(file, this.object_fid)
		    .subscribe((ans) => {
		    	if (ans === SocketTypes.DENIED) {

		    	}
		    	else {

		    	}
		    });
    	}

	}

}
