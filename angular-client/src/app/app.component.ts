import { Component } from '@angular/core';
import * as moment from 'moment';
import { NgxEmojiPickerModule } from 'ngx-emoji-picker';
import { ChatService } from './chat.service';
import * as io from 'socket.io-client';
import * as $ from 'jquery';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  ROBOT_USER_ID: String
  userOnChatBoxWithProfilePicture: String
  userOpenedOnChatBox: String
  userOnChatBoxWithNames: String
  messageInput: String
  emailInputToEmailChat: String
  users: Object[] = []
  messages: Object[] = []
  socket: SocketIOClient.Socket

  constructor(public chatService: ChatService) {
    this.socket = io.connect('http://localhost:3000')
  }
  ngOnInit() {
    this.getConversations()
    this.initSocketIOListener()
    this.ROBOT_USER_ID = "113999683792797"
  }

  initSocketIOListener() {
    this.socket.on('messageFromNewUser', (data: any) => {
      this.playAudioOnNotification()
      this.appendMessageToMessagesTrend(true, data[0]['_id'], data[0])
      document.getElementById(`newMessageBadge_${data[0]['_id']}`).innerHTML = `<i class='fa fa-envelope'></i>`
    })

    this.socket.on('messageFromExistingUser', (data: any) => {
      this.playAudioOnNotification()
      let { message, recipient, sender, timestamp } = data.webhook_event_content

      if (this.userOpenedOnChatBox == sender.id) {
        this.appendNewMessage(sender.id, message.text, timestamp)
      } else {
        this.appendMessageToMessagesTrend(false, sender.id, data.webhook_event_content)
        document.getElementById(`newMessageBadge_${sender.id}`).innerHTML = `<i class='fa fa-envelope'></i>`
        document.getElementById(`last_message_${sender.id}`).innerHTML =
          `<i class='fa fa-chevron fa-chevron-right'> | </i> ${message.text.length > 7 ? message.text.substring(0, 6) + '...' : message.text}`
      }
    });
  }

  appendMessageToMessagesTrend(isNewUser: boolean, senderId: any, messageData: any) {
    if (isNewUser) {

      console.log("New User")
      this.users.push(messageData)

    } else {

      var indexOfUser = this.users.findIndex(user => user['_id'] === senderId);
      if (indexOfUser > -1) {
        this.users[indexOfUser]['messages'].push(messageData)
      }

    }
  }

  sendMessage() {
    if (this.userOpenedOnChatBox && this.messageInput) {

      this.socket.emit('messageFromBotClientApp', { receiverId: this.userOpenedOnChatBox, messageContent: this.messageInput })

      this.appendNewMessage(this.ROBOT_USER_ID, this.messageInput, (new Date()).getTime())
      this.messageInput = ''
    }
  }

  scrollToBottomOfChatBox() {
    var chatBoxDiv = document.getElementById("chat-box-message-box")
    chatBoxDiv.scrollTop = chatBoxDiv.scrollHeight;
  }

  playAudioOnNotification() {
    let audio = new Audio();
    audio.src = "../../../assets/sounds/2.ogg";
    audio.load();
    audio.play();
  }

  appendNewMessage(sender: any, message: any, timeStamp: any,) {
    this.messages.push({
      "sender": {
        "id": sender
      },
      "timestamp": timeStamp,
      "message": {
        "text": message
      }
    })
  }

  getConversations() {
    this.chatService.getConversations()
      .then(users => {
        users.forEach(user => {
          this.users.push(user);
        });
        this.showMessage(0)
      }).catch(error => console.log(error));
  }

  showMessage(index) {
    this.messageInput = ""
    this.messages = this.users[index]['messages'];
    this.userOnChatBoxWithProfilePicture = this.users[index]['profileImage']
    this.userOpenedOnChatBox = this.users[index]['_id']
    this.userOnChatBoxWithNames = this.users[index]['firstName'] + " " + this.users[index]['lastName']
    this.scrollToBottomOfChatBox()
    document.getElementById(`newMessageBadge_${this.users[index]['_id']}`).innerHTML = ""
  }
  insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  toggled: boolean = false;
  handleSelection(event) {
    this.messageInput += event.char;
  }


  sendEmail() {
    document.getElementById("closeModalButton").click();
    if (this.validateEmail(this.emailInputToEmailChat)) {
      this.chatService.emailChat(this.emailInputToEmailChat, this.userOpenedOnChatBox)
        .then(response => {

          response == 'sent' ?
            alert(`Response : ✔️Successfuly sent chat script`) :
            alert(`Response : ❌Error sending chat script`)

          this.emailInputToEmailChat = ""
        }).catch(error => alert(`Error : 
        ❌  ${error}`));
    }
  }

  validateEmail = (email: any) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  formatMessageTimeStamp(timestamp: any) {
    return moment(timestamp).format('lll')
  }
}
