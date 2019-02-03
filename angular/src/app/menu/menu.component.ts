import { Component, OnInit } from '@angular/core';
import { AppService } from '@shared/app.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {


	constructor(public appService: AppService) {

	}

	public menu_links = [
		{ label: "Моя страница", link: `/page/${this.appService.user.id}` },
		{ label: "Сообщения", link: `/mail` },
		{ label: "Новости", link: `/news` },
		{ label: "Друзья", link: `/friends` },
		{ label: "Группы", link: `/groups` },
		{ label: "Диск", link: `/disk/${this.appService.user.id}` },
		{ label: "Настройки", link: `/settings` },
	];

	ngOnInit() {
		this.appService.app_init.subscribe((data) => {
			this.menu_links[0]['link'] = `/page/${this.appService.getUserId()}`;
			this.menu_links[5]['link'] = `/disk/${this.appService.getUserId()}`;
		});
	}

}
