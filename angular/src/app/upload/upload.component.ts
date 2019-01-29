import { Component, OnInit } from '@angular/core';
import { HttpService } from '@shared/http.service';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.sass']
})
export class UploadComponent implements OnInit {

	constructor(private httpService: HttpService) { }

	public preview = {};

	ngOnInit() {
	}

	onChange(event) {

		let fileList: FileList = event.target.files;
		if(fileList.length > 0) {
			let file: File = fileList[0];
			let formData: FormData = new FormData();
			formData.append('uploadFile', file, file.name);

			let headers = new Headers();
			headers.append('Content-Type', 'multipart/form-data');
			headers.append('Accept', 'application/json');
			let options = { headers: headers };

			this
			.httpService
			.post(``, formData, options)
		    .subscribe(
		        data => {
		        	console.log('success');
		        },
		        error => console.log(error)
		    )

    	}

	}

}
