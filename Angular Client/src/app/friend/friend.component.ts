import { Component, OnInit } from '@angular/core';
import { AppService } from '@shared/app.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.sass']
})
export class FriendComponent implements OnInit {

  constructor(public appService: AppService) { }

  ngOnInit() {
  }

}
