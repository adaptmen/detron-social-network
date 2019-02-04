import { Component, OnInit } from '@angular/core';
import { AppService } from '@shared/app.service';
import { SocketProvider } from '@providers/socket.provider';
import { ActivatedRoute} from '@angular/router';
import SocketTypes from '@app/SocketTypes';

@Component({
	selector: 'app-page',
	templateUrl: './page.component.html',
	styleUrls: ['./page.component.sass']
})
export class PageComponent implements OnInit {

	constructor(public appService: AppService,
	 public route: ActivatedRoute,
	 public socketProvider: SocketProvider) { }

	public page: any;
	public error = false;

	public getFilePreview(file: any) {
		if (file.type == 'jpg' || file.type == 'jpeg' || file.type == 'png') {
			return `/disk/wall_${this.page.wall.id}/${file.id}`;
		}
	}

	public viewUpload(object_fid) {
		this.appService.view_upload.next(object_fid);
	}

	ngOnInit() {
		if (this.appService.inited) {
			this.page = {};
			this.page.id = this.route.snapshot.paramMap.get("id");
			this
			.socketProvider
			.sendRequest(SocketTypes.GET_PAGE, { id: this.page.id })
			.subscribe((ans) => {
				if (ans == SocketTypes.ERROR) { this.error = true }
				else { this.page = ans; }
			});
		}
		else {
			this.appService.onConnect.subscribe(() => {
				this.page = {};
				this.page.id = this.route.snapshot.paramMap.get("id");
				this
				.socketProvider
				.sendRequest(SocketTypes.GET_PAGE, { id: this.page.id })
				.subscribe((ans) => {
					if (ans == SocketTypes.ERROR) { this.error = true }
					else { this.page = ans; }
				});
			});
		}
	}

}
