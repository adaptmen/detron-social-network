import { Component, OnInit } from '@angular/core';
import { AppService } from '@shared/app.service';
import { ActivatedRoute} from '@angular/router';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.sass']
})
export class ChatComponent implements OnInit {

	constructor(private appService: AppService, private route: ActivatedRoute) { }

	public chat_id;

	ngOnInit() {
		let chat_id = this.route.snapshot.paramMap.get("chat_id");

	}

}
