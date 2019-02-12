import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppService } from '@shared/app.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

	constructor(private appService: AppService) { }


	@ViewChild('nameInput') nameInputRef: ElementRef;
	@ViewChild('ageInput') ageInputRef: ElementRef;
	@ViewChild('statusInput') statusInputRef: ElementRef;
	@ViewChild('cityInput') cityInputRef: ElementRef;

	public input_name = false;
	public city_name = false;
	public status_name = false;
	public age_name = false;

	public setChange(changeObj) {
		
	}

	ngOnInit() {
	}

}
