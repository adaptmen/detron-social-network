import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
	selector: 'app-audio',
	templateUrl: './audio.component.html',
	styleUrls: ['./audio.component.sass']
})
export class AudioComponent implements OnInit {

	@ViewChild('audioOption') audioPlayerRef: ElementRef;

	constructor() { }

	ngOnInit() {
	}

	onAudioPlay(){
		this.audioPlayerRef.nativeElement.play();
	}

	public isPlayed = false;

	togglePlay() {
		this.isPlayed
		? this.audioPlayerRef.nativeElement.pause()
		: this.audioPlayerRef.nativeElement.play();

		this.isPlayed = !this.isPlayed;
	}

}
