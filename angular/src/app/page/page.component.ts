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

	ngOnInit() {
		this.appService.onConnect.subscribe(() => {
			this.page = {};
			this.page.id = this.route.snapshot.paramMap.get("page_id");
			this
			.socketProvider
			.sendRequest(SocketTypes.GET_PAGE, this.page.id)
			.subscribe((ans) => {
				if (ans == SocketTypes.ERROR) { this.error = true }
				else { this.page = ans; }
			});
		});
	}

}
