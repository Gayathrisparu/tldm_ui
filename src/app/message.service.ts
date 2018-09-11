import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Message} from './message';
import {MessageBody} from './messagebody';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from './user';


@Injectable({
    providedIn: 'root'
})
export class MessageService {

    private serverUrl = 'http://172.23.239.122:8080/gs-guide-websocket';
    private stompClient = null;

    messagesArr: MessageBody[] = [];

    sender: User;
    receiver: User;

    senderId: string;
    receiverId: string;

    constructor(private http: HttpClient) {
    }

    establishConnection() {
        const socket = new SockJS(this.serverUrl);
        this.stompClient = Stomp.over(socket);
        const that = this;
        this.stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            that.stompClient.subscribe('/topic/response', function (message) {
                that.showGreeting(JSON.parse(message.body));
            });
        });
    }

    getAllMessagesBySenderAndReceiver(): Observable<Message[]> {
        return this.http.get<Message[]>(`http://172.23.239.122:8080/api/v1/message/${this.sender.userId}/${this.receiver.userId}`);
    }

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log('Disconnected');
    }

    showGreeting(message) {
        this.messagesArr.push(message);
    }

    setSender(sender: User) {
        this.sender = sender;
    }

    setReceiver(receiver: User) {
        this.receiver = receiver;
    }

    sendMessage(message: string) {
        this.stompClient.send('/app/chat', {}, JSON.stringify({
            'messageContent': message, 'sender': this.sender, 'receiver': this.receiver
        }))
        ;
    }
}
