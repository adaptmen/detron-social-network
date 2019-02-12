import { Component } from '@angular/core';
import { AppService } from '@shared/app.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.sass']
})
export class AppComponent {
	
	public object_fid = '';
	public upload_view = false;

	constructor(public appService: AppService) {
		this.appService.view_upload
		.subscribe((object_fid) => {
			this.viewUpload(object_fid)
		});
	}

	public viewUpload(object_fid) {
		this.upload_view = true;
		this.object_fid = object_fid;
	}

	public closeUpload() {
		this.upload_view = false;
		this.object_fid = '';
	}

}
