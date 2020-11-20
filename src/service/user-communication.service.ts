import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { scan } from 'rxjs/operators';
import { UserAction, UserInfo } from './../models/peerData.interface';
import { Injectable } from '@angular/core';
import { SignalrService } from './signalr.service';
import { UtilService } from './../service/util.service';

import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class UserCommunicationService {

  public currentUser: string;
  public liveUsersList$: Observable<Array<UserInfo>>;



  private userAction$: BehaviorSubject<UserAction>;
  private hubConnection: signalR.HubConnection;



  constructor(private signalR: SignalrService, private util: UtilService) {
    this.userAction$ = new BehaviorSubject(null);

    this.liveUsersList$ = this.userAction$.pipe(scan<UserAction, Array<UserInfo>>((acc, user) => {
      const acclist = (acc) ? acc : [];
      if (user.action === 'add') {
        return acclist.concat(user);
      } else if (user.action === 'delete') {
        return acclist.filter(x => x.connectionId !== user.connectionId);
      } else {
        return acclist;
      }
    }));

  }

  public async openCommunicationChanel() {

    this.hubConnection = await this.startConnection();
    this.lessenUserEvents();
  }

  public async goLive() {

    this.currentUser = this.util.getRandomColor();
    await this.signalR.newUserConnection(this.currentUser);
  }


  private async lessenUserEvents() {

    this.hubConnection.on('NewUserArrived', (data) => {
      let user = JSON.parse(data);
      user = Object.assign(user, { action: 'add' });
      this.userAction$.next(user);
    });

    this.hubConnection.on('UserDisconnect', (data) => {
      const user = { connectionId: data, action: 'delete', };
      this.userAction$.next(user);
    });

    this.hubConnection.on('UserSaidHello', (data) => {

      // const user = JSON.parse(data);
      // const curentUsers = this.liveUsers.getValue();
      // const userList = [...curentUsers, user];
      // this.liveUsers.next(userList);
    });

    // this.hubConnection.on('UserDisconnect', (data) => {
    //   this.disconnectedPeer.next(JSON.parse(JSON.stringify(data)));
    // });

    // this.hubConnection.on('SendSignal', (user, signal) => {
    //   this.signal.next({ user, signal });
    // });
  }





  private async startConnection(): Promise<signalR.HubConnection> {
    try {
      return await this.signalR.startConnection();
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }


}
