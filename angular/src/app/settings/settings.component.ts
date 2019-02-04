import { Component, OnInit } from '@angular/core';
import { AppService } from '@shared/app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

  constructor(private appService: AppService) { }

  ngOnInit() {
  }

}
