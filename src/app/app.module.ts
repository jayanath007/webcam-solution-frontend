import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatListModule, MatToolbarModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { IncomingCallDialogPopupComponent } from './incoming-call-dialog-popup/incoming-call-dialog-popup.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    IncomingCallDialogPopupComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatCardModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
  ],
  entryComponents: [IncomingCallDialogPopupComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
