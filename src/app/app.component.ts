import { PeerData, UserInfo } from './../models/peerData.interface';
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

  constructor(public communication: UserCommunicationService) { }

  async ngOnInit() {

    await this.communication.openCommunicationChanel();


    this.subscriptions.add(this.communication.onStream$.subscribe((data: PeerData) => {
      this.videoConnectionId = data.id;
      this.videoPlayer.nativeElement.srcObject = data.data;
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }));

  }

  goLive() {
    this.communication.goLive();
  }

  async shareWebcam(user) {

    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const peer = this.communication.createPeer(this.stream, user.connectionId, true);
    this.communication.currentPeer = peer;

  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
