import { UserInfo } from '../models/interfaces';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection;

  private liveUsers = new Subject<UserInfo>();
  public liveUsers$ = this.liveUsers.asObservable();


  constructor() { }


  public async startConnection(): Promise<signalR.HubConnection> {
    try {

      this.hubConnection = this.buildHubConnectionBuild();
      await this.hubConnection.start();
      return this.hubConnection;
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
    console.log('Connection started');
  }


  public buildHubConnectionBuild(): signalR.HubConnection {

    return this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44366/signalrWebrtc')
      .build();
  }

  public newUserConnection(user: string) {
    this.hubConnection.invoke('NewUser', user);
  }

  public sendSignalToUser(signal: string, userTocall: string, currentUser: string) {
    this.hubConnection.invoke('SendSignal', signal, userTocall, currentUser);
    console.log(userTocall);
  }

  public sendAcceptCall(callFrom: string, signal: string) {
    this.hubConnection.invoke('CallAccepted', callFrom, signal);
    console.log(callFrom);
  }




}
