import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) {
  }

  getConversations() {
    return new Promise<any>((resolve, rejects) => {
      this.http.get('http://localhost:3000/')
        .subscribe(
          data => {
            console.log("Data", data); resolve(data)
          },
          error => { console.log("Error", error); rejects(error) }
        );
    })
  }

  emailChat(userEmailAddress: any, userId: any) {
    let data = {
      'userEmailAddress': userEmailAddress,
      'userIdToGetChatWith': userId
    };

    return new Promise<any>((resolve, rejects) => {
      this.http.post('http://localhost:3000/sendChatScriptWithUser', data)
        .subscribe(
          data => {
            console.log("Data", data); resolve(data)
          },
          error => { console.log("Error", error); rejects(error) }
        );
    })
  }
}
