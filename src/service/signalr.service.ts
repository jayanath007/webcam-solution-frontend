import { UserInfo } from './../models/peerData.interface';
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

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44327/signalrtc')
      .build();

    await this.hubConnection.start();
    console.log('Connection started');
    return this.hubConnection;

  }

  public async newUserConnection(user: string): Promise<void> {
    this.hubConnection.invoke('NewUser', user);
  }


  public sendSignalToUser(signal: string, user: string) {
    this.hubConnection.invoke('SendSignal', signal, user);
  }

  public sayHello(userName: string, user: string): void {
    this.hubConnection.invoke('HelloUser', userName, user);
  }



}
