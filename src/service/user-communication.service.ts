import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { scan } from 'rxjs/operators';
import { PeerData, SignalInfo, UserAction, UserInfo } from './../models/peerData.interface';
import { Injectable } from '@angular/core';
import { SignalrService } from './signalr.service';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { Instance } from 'simple-peer';

declare var SimplePeer: import('simple-peer').SimplePeer;

@Injectable({
  providedIn: 'root'
})
export class UserCommunicationService {

  public currentUser: string;
  public currentPeer: Instance;
  public liveUsersList$: Observable<Array<UserInfo>>;


  private onStream = new Subject<PeerData>();
  public onStream$ = this.onStream.asObservable();


  private userAction$: BehaviorSubject<UserAction>;
  private hubConnection: signalR.HubConnection;

  private signal = new Subject<SignalInfo>();
  public signal$ = this.signal.asObservable();



  constructor(private signalR: SignalrService) {
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

    this.hubConnection.on('SendSignal', (user, signal) => {
      this.signal.next({ user, signal });
    });
  }

  public async goLive(username) {

    this.currentUser = username;
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

  }
  private async startConnection(): Promise<signalR.HubConnection> {
    try {
      return await this.signalR.startConnection();
    } catch (error) {
      console.error(`Can't join room, error ${error}`);
    }
  }

  public createPeer(stream, userId: string, initiator: boolean): Instance {
    const peer = new SimplePeer({ initiator, stream });

    peer.on('signal', data => {
      const stringData = JSON.stringify(data);
      this.sendSignalToUser(stringData, userId);
    });

    peer.on('stream', data => {
      console.log('on stream', data);
      this.onStream.next({ id: userId, data });
    });

    this.currentPeer = peer;
    return peer;
  }

  public signalPeer(userId: string, signal: string, stream: any) {
    if (userId !== this.currentUser) {
      const signalObject = JSON.parse(signal);
      if (this.currentPeer) {
        this.currentPeer.signal(signalObject);
      } else {
        const currentPeer = this.createPeer(stream, userId, false);
        currentPeer.signal(signalObject);
      }
    }
  }
  
  public sendSignalToUser(signal: string, user: string) {
    this.hubConnection.invoke('SendSignal', signal, user);
    console.log(signal, user);
  }


}
