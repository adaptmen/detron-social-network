import { Component, OnInit } from '@angular/core';
import { AppService } from '@shared/app.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.sass']
})
export class HistoryComponent implements OnInit {

  constructor(public appService: AppService) { }

  ngOnInit() {
  }

}
