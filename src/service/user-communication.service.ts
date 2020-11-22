import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { scan } from 'rxjs/operators';
import { PeerData, SignalInfo, UserAction, UserInfo, IncomingCallInfor } from '../models/interfaces';
import { Injectable } from '@angular/core';
import { SignalrService } from './signalr.service';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

declare var SimplePeer: import('simple-peer').SimplePeer;

@Injectable({
  providedIn: 'root'
})
export class UserCommunicationService {

  public currentUser: string;

  public liveUsersList$: Observable<Array<UserInfo>>;

  private onStream = new Subject<PeerData>();
  public onStream$ = this.onStream.asObservable();

  private userAction$: BehaviorSubject<UserAction>;

  private signal = new Subject<SignalInfo>();
  public signal$ = this.signal.asObservable();

  private incominCall = new Subject<any>();
  public incominCall$ = this.incominCall.asObservable();

  private hubConnection: signalR.HubConnection;



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

    this.hubConnection = await this.signalR.startConnection();
  

    this.hubConnection.on('NewUserArrived', (data) => {
      let user = JSON.parse(data);
      user = Object.assign(user, { action: 'add' });
      this.userAction$.next(user);
    });

    this.hubConnection.on('UserDisconnect', (data) => {
      const user = { connectionId: data, action: 'delete', };
      this.userAction$.next(user);
    });

    this.hubConnection.on('SendSignal', (data) => {
      this.incominCall.next(data);
    });

  }


  public acceptCall(incomingCallData, stream) {

    const incomingCall = JSON.parse(incomingCallData);
    const peer = new SimplePeer({ initiator: false, stream, trickle: false });

    peer.on('signal', signal => {
      const calleeSignal = JSON.stringify(signal);
      this.signalR.sendAcceptCall(incomingCall.callFrom, calleeSignal);
    });
    peer.on('stream', data => {
      console.log('on stream', data);
      this.onStream.next({ id: incomingCall.userTocall, data , patnerUserName: incomingCall.callFromUserName });
    });
    peer.signal(incomingCall.signal);
  }



  public callPeer(stream, userTocall: string, userTocallName: string, initiator: boolean) {

    const peer = new SimplePeer({ initiator, stream, trickle: false });
    console.log('step 1 send signal to callee');

    peer.on('signal', callerSignal => {
      const stringData = JSON.stringify(callerSignal);
      this.signalR.sendSignalToUser(stringData, userTocall, this.currentUser);
    });

    peer.on('stream', data => {
      console.log('on stream', data);
      this.onStream.next({ id: userTocall, data, patnerUserName: userTocallName });
    });

    this.hubConnection.on('CallAccepted', (signal) => {
      peer.signal(signal);
    });

  }


  public goLive(username) {
    this.currentUser = username;
    this.signalR.newUserConnection(this.currentUser);
  }






}
