import { Component, OnInit } from '@angular/core';
import { HttpService } from '@shared/http.service';
import { UploadService } from '@shared/upload.service';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.sass']
})
export class UploadComponent implements OnInit {

	constructor(private httpService: HttpService, private uploadService: UploadService) { }

	public preview = {};

	ngOnInit() {
	}

	onChange(event) {

		let fileList: FileList = event.target.files;
		if(fileList.length > 0) {
			let file: File = fileList[0];

		    this
		    .uploadService
		    .uploadFile(file)
		    .subscribe((ans) => {
		    	if (ans === SocketTypes.DENIED) {

		    	}
		    	else {

		    	}
		    });
    	}

	}

}
