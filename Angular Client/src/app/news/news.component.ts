import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '@shared/app.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.sass']
})
export class NewsComponent implements OnInit {

	constructor(@Inject(forwardRef(() => ActivatedRoute)) public route: ActivatedRoute,
		@Inject(forwardRef(() => AppService)) public appService: AppService) { }

	ngOnInit() {
		//this.appService.current_url = this.route.snapshot.routeConfig.path;
		//let mode = this.route.snapshot.paramMap.get("mode");
	}

}
