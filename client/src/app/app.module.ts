import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms'
import { YouTubePlayerModule } from "@angular/youtube-player";

// lets us use http request for our api
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { CardComponent } from './components/card/card.component';
import { ApodComponent } from './components/apod/apod.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    ApodComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    YouTubePlayerModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
