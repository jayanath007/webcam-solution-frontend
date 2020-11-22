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

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44366/signalrtc')
      .build();

    await this.hubConnection.start();
    console.log('Connection started');
    return this.hubConnection;

  }

  public async newUserConnection(user: string): Promise<void> {
    this.hubConnection.invoke('NewUser', user);
  }




}
