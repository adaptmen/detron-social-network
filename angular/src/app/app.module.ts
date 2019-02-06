import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MailComponent } from './mail/mail.component';
import { NewsComponent } from './news/news.component';
import { UploadComponent } from './upload/upload.component';
import { MenuComponent } from './menu/menu.component';
import { WallComponent } from './wall/wall.component';
import { SearchComponent } from './search/search.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatComponent } from './chat/chat.component';
import { PageComponent } from './page/page.component';
import { HistoryComponent } from './history/history.component';
import { FriendComponent } from './friend/friend.component';

import { SecurityHelper } from '@helpers/security.helper';
import { SocketProvider } from '@providers/socket.provider';
import { AppService } from '@shared/app.service';
import { UploadService } from '@shared/upload.service';
import { HttpService } from '@shared/http.service';
import { CookieService } from 'ngx-cookie-service';
import { AudioComponent } from './audio/audio.component';

@NgModule({
	declarations: [
		AppComponent,
		MailComponent,
		NewsComponent,
		UploadComponent,
		MenuComponent,
		WallComponent,
		SearchComponent,
		SettingsComponent,
		ChatComponent,
		PageComponent,
		HistoryComponent,
		FriendComponent,
		AudioComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule
	],
	providers: [
		SocketProvider,
		AppService,
		HttpService,
		UploadService,
		CookieService,
		SecurityHelper
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
