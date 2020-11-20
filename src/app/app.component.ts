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


  async ngOnInit() {

  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
