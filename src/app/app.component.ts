import { UtilService } from './../service/util.service';
import { PeerData, SignalInfo, UserInfo } from './../models/peerData.interface';
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
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;
  private stream;

  constructor(public communication: UserCommunicationService, private util: UtilService) { }

  async ngOnInit() {

    await this.communication.openCommunicationChanel();


    this.subscriptions.add(this.communication.signal$.subscribe((signalData: SignalInfo) => {
      this.communication.signalPeer(signalData.user, signalData.signal, this.stream);
    }));


    this.subscriptions.add(this.communication.onStream$.subscribe((data: PeerData) => {
      this.videoConnectionId = data.id;
      this.videoPlayer.nativeElement.srcObject = data.data;
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }));

  }

  goLive() {
    const username = this.util.getRandomColor();
    this.communication.goLive(username);
  }

  async shareWebcam(user) {

    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.communication.createPeer(this.stream, user.connectionId, true);

  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
