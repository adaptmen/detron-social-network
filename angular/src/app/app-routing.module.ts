import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsComponent } from '@app/news/news.component';
import { PageComponent } from '@app/page/page.component';
import { MailComponent } from '@app/mail/mail.component';
import { ChatComponent } from '@app/chat/chat.component';
import { FriendComponent } from '@app/friend/friend.component';
import { SearchComponent } from '@app/search/search.component';
import { SettingsComponent } from '@app/settings/settings.component';

const routes: Routes = [
	{ path: '', component: NewsComponent },
	{ path: 'news', component: NewsComponent },
	{ path: 'page', component: PageComponent },
	{ path: 'page/:id', component: PageComponent },
	{ path: 'mail', component: MailComponent },
	{ path: 'mail/:chat_id', component: ChatComponent },
	{ path: 'friend', component: FriendComponent },
	{ path: 'friend/:id', component: FriendComponent },
	{ path: 'search', component: SearchComponent },
	{ path: 'settings', component: SettingsComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
