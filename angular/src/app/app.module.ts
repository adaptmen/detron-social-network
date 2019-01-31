import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
    HistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
