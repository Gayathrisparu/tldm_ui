import {Injectable} from '@angular/core';
import {Channel} from '../model/channel';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../model/user';
import {MessageService} from './message.service';

const httpOptions = {
    headers: new HttpHeaders({'content-Type': 'application/json'})
};

@Injectable({
    providedIn: 'root'
})
export class ChannelService {

    name: string;
    channel: Channel;
    channels: Channel[];
    user: User;

    isChannelActive: boolean;

    isAllowedForChannel: boolean;

    baseUrl = 'http://172.23.239.206:8063/Channel-Service/api/v1/channel';

    constructor(private httpClient: HttpClient,
                private messageService: MessageService) {
    }

    setChannel(channel: Channel) {
        this.channel = channel;

        for (let i = 0; i < this.channel.channelUsers.length; i++) {
            if (this.channel.channelUsers[i].userId === this.messageService.sender.userId) {
                this.isAllowedForChannel = true;
            }
        }
    }

    getChannel(channel: Channel) {
        this.channel = channel;
    }

    setChannels(channels: Channel[]) {
        this.channels = channels;
    }

    getChannels(channels: Channel[]) {
        this.channels = channels;

    }

    getAllChannels(): Observable<Channel[]> {
        return this.httpClient.get<Channel[]>(this.baseUrl);
    }

    getChannelDetailByChannelName(name: string): Observable<Channel> {
        return this.httpClient.get<Channel>(`${this.baseUrl}/${name}`);
    }

    // creating a channel
    createChannel(channel: Channel): Observable<Channel> {
        return this.httpClient.post<Channel>(this.baseUrl, channel, httpOptions);
    }

    // fetching list of all channels that a user is a part of
    getAllChannelsByUserId(user: User): Observable<Channel[]> {
        return this.httpClient.get<Channel[]>(`${this.baseUrl}/users/${user.userId}`);
    }

    // fetching and setting channels object for ui
    fetchChannels() {
        this.getAllChannelsByUserId(this.messageService.sender).subscribe(data => {
            this.channels = data;
            this.messageService.establishConnectionForChannel(this.channels);
        });
    }
    getUsersByChannelName(channelName: string): Observable<User[]> {
        return this.httpClient.get<User[]>(`${this.baseUrl}/getuser/${this.channel.channelName}`);
        
    }
}
