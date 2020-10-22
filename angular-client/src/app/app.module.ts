import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { ChatService } from './chat.service';
import { from } from 'rxjs';
import { NgxEmojiPickerModule } from 'ngx-emoji-picker';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    NgxEmojiPickerModule
  ],
  providers: [HttpClient, FormsModule, ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
