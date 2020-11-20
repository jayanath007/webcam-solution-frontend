import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { scan } from 'rxjs/operators';
import { PeerData, UserAction, UserInfo } from './../models/peerData.interface';
import { Injectable } from '@angular/core';
import { SignalrService } from './signalr.service';
import { UtilService } from './../service/util.service';

import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { Instance } from 'simple-peer';



declare var SimplePeer: any;
@Injectable({
  providedIn: 'root'
})
export class UserCommunicationService {

  public currentUser: string;
  public currentPeer: Instance;
  public liveUsersList$: Observable<Array<UserInfo>>;


  private onSignalToSend = new Subject<PeerData>();
  public onSignalToSend$ = this.onSignalToSend.asObservable();

  private onStream = new Subject<PeerData>();
  public onStream$ = this.onStream.asObservable();

  private onConnect = new Subject<PeerData>();
  public onConnect$ = this.onConnect.asObservable();

  private onData = new Subject<PeerData>();
  public onData$ = this.onData.asObservable();


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

  public createPeer(stream, userId: string, initiator: boolean): Instance {
    const peer = new SimplePeer({ initiator, stream });

    peer.on('signal', data => {
      const stringData = JSON.stringify(data);
      this.onSignalToSend.next({ id: userId, data: stringData });
    });

    peer.on('stream', data => {
      console.log('on stream', data);
      this.onStream.next({ id: userId, data });
    });

    peer.on('connect', () => {
      this.onConnect.next({ id: userId, data: null });
    });

    peer.on('data', data => {
      this.onData.next({ id: userId, data });
    });

    return peer;
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

 
  }

  public signalPeer(userId: string, signal: string, stream: any) {
    const signalObject = JSON.parse(signal);
    if (this.currentPeer) {
      this.currentPeer.signal(signalObject);
    } else {
      this.currentPeer = this.createPeer(stream, userId, false);
      this.currentPeer.signal(signalObject);
    }
  }

  private async startConnection(): Promise<signalR.HubConnection> {
    try {
      return await this.signalR.startConnection();
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }


}
