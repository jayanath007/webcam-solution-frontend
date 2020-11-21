import { UtilService } from './../service/util.service';
import { IncomingCallInfor, PeerData, SignalInfo, UserInfo } from './../models/peerData.interface';
import { UserCommunicationService } from './../service/user-communication.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'webcam-solution-frontend';

  videoConnectionId;
  public subscriptions = new Subscription();


  @ViewChild('remoteUserVideoPlayer', { static: false }) remoteUserVideoPlayer: ElementRef;



  constructor(public communication: UserCommunicationService, private util: UtilService) { }

  async ngOnInit() {

    await this.communication.openCommunicationChanel();
    this.subscriptions.add(this.communication.incominCall$.subscribe(
      async (incomingCall) => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        this.communication.acceptCall(incomingCall, stream);
      }));


    this.subscriptions.add(this.communication.onStream$.subscribe((data: PeerData) => {
      this.videoConnectionId = data.id;
      this.remoteUserVideoPlayer.nativeElement.srcObject = data.data;
      this.remoteUserVideoPlayer.nativeElement.load();
      this.remoteUserVideoPlayer.nativeElement.play();
    }));

  }

  goLive() {
    const username = this.util.getRandomColor();
    this.communication.goLive(username);
  }

  async shareWebcam(user) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    await this.communication.callPeer(stream, user.connectionId, true);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
