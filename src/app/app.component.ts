import { UtilService } from './../service/util.service';
import { PeerData } from '../models/interfaces';
import { UserCommunicationService } from './../service/user-communication.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IncomingCallDialogPopupComponent } from './incoming-call-dialog-popup/incoming-call-dialog-popup.component';
import { MatDialog } from '@angular/material';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { map } from 'rxjs/internal/operators/map';
import { filter } from 'rxjs/internal/operators/filter';
import { debug } from 'console';


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

  constructor(public communication: UserCommunicationService, private util: UtilService, private dialog: MatDialog) {


  }

  async ngOnInit() {

    await this.communication.openCommunicationChanel();

    const incominCallMassagePopup$ = this.communication.incominCall$.pipe(switchMap((incominCallInfor) => {
      const infor = JSON.parse(incominCallInfor);
      return this.dialog.open(IncomingCallDialogPopupComponent, { data: infor.callFromUserName }).afterClosed()
        .pipe(filter((isAccepted) => isAccepted), map(() => {
          return incominCallInfor;
        }));
    }));

    this.subscriptions.add(incominCallMassagePopup$.subscribe(
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
