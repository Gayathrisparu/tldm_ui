import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Message} from '../model/message';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../model/user';
import {Notification} from '../model/notification';
import {DisplayMessage} from '../model/display-message';
import {Channel} from '../model/channel';
import {ChannelMessage} from '../model/channel-message';


@Injectable({
    providedIn: 'root'
})
export class MessageService {

    private userServerUrl = 'http://172.23.239.122:8067/user-web-socket';
    private channelServerUrl = 'http://172.23.239.122:8067/channel-web-socket';
    private stompClientUser = null;
    private stompClientChannel = null;


    messagesArr: Message[] = [];
    messages: Message[] = [];

    channelMessagesArr: ChannelMessage[];
    channelMessages: ChannelMessage[];

    sender: User;
    receiver: User;

    displayName: boolean;

    notification = new Notification(false, 'userId');
    displayMessage = new DisplayMessage(false, 'userId');

    constructor(private http: HttpClient) {
    }

    establishConnectionForUser(userId: string) {
        const socket = new SockJS(this.userServerUrl);
        this.stompClientUser = Stomp.over(socket);
        const that = this;
        this.stompClientUser.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            that.stompClientUser.subscribe(`/topic/response/${userId}`, function (message) {
                that.showGreetingForUser(JSON.parse(message.body));
                console.log(message.body);
            });
        });
    }

    establishConnectionForChannel(channelList: Channel[]) {
        const socket = new SockJS(this.channelServerUrl);
        this.stompClientChannel = Stomp.over(socket);
        const that = this;
        this.stompClientChannel.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            for (let i = 0; i < channelList.length; i++) {
                that.stompClientChannel.subscribe(`/topic-group/response/${channelList[i].channelId}`, function (message) {
                    that.showGreetingForChannel(JSON.parse(message.body));
                });
            }
        });
    }

    getAllMessagesBySenderAndReceiver(): Observable<Message[]> {
        console.log('from message service');
        console.log(this.receiver);
        return this.http.get<Message[]>(`http://172.23.239.104:8068/api/v1/message/${this.sender.userId}/${this.receiver.userId}`);
    }

    getAllMessagesByChannelId(channelId: string): Observable<ChannelMessage[]> {
        return this.http.get<ChannelMessage[]>(`http://172.23.239.104:8068/api/v1/channel-message/${channelId}`);
    }

    disconnectUser() {
        if (this.stompClientUser !== null) {
            this.stompClientUser.disconnect();
        }
        console.log('User Disconnected');
    }

    disconnectChannel() {
        if (this.stompClientChannel !== null) {
            this.stompClientChannel.disconnect();
        }
        console.log('Channel Disconnected');
    }

    showGreetingForUser(message) {
        this.notification = new Notification(true, message.sender.userId);
        console.log(this.notification);
        this.messagesArr.push(message);
    }

    showGreetingForChannel(message) {
        this.notification = new Notification(true, message.sender.userId);
        console.log(this.notification);
        this.channelMessagesArr.push(message);
    }

    getSender(): User {
        return this.sender;
    }

    setSender(sender: User) {
        this.sender = sender;
    }

    getReceiver(): User {
        return this.receiver;
    }

    setReceiver(receiver: User) {
        this.receiver = receiver;
    }

    sendMessageToUser(message: Message) {
        console.log('from message service');
        console.log(message);
        this.stompClientUser.send('/app/chat', {}, JSON.stringify(message));
    }

    sendMessageToChannel(channelMessage: ChannelMessage) {
        console.log(channelMessage);
        this.stompClientChannel.send('/app/channel-chat', {}, JSON.stringify(channelMessage));
    }

    setMessages(messages: Message[]) {
        this.clearMessages();

        messages.sort((message1, message2) => {
            if (message1.timestamp < message2.timestamp) {
                return -1;
            } else if (message1.timestamp > message2.timestamp) {
                return 1;
            } else {
                return 0;
            }
        });

        this.messages = messages;
    }

    setChannelMessages(channelMessages: ChannelMessage[]) {
        this.clearMessages();

        channelMessages.sort((message1, message2) => {
            if (message1.timestamp < message2.timestamp) {
                return -1;
            } else if (message1.timestamp > message2.timestamp) {
                return 1;
            } else {
                return 0;
            }
        });

        this.channelMessages = channelMessages;
    }

    clearMessages() {
        this.messages = [];
        this.messagesArr = [];
        this.channelMessages = [];
        this.channelMessagesArr = [];
    }

    resetNotification() {
        this.notification.isActive = false;
    }

    setDisplayMessage(userId: string) {
        this.displayMessage = new DisplayMessage(true, userId);
    }
}
