import { UserInfo } from './../models/peerData.interface';
import { UserCommunicationService } from './../service/user-communication.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'webcam-solution-frontend';
  public subscriptions = new Subscription();

  constructor(public communication: UserCommunicationService) { }

  async ngOnInit() {
    await this.communication.openCommunicationChanel();
  }

  goLive() {
    this.communication.goLive();
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
