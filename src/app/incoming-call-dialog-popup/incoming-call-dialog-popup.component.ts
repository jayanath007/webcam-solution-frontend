import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-incoming-call-dialog-popup',
  templateUrl: './incoming-call-dialog-popup.component.html',
  styleUrls: ['./incoming-call-dialog-popup.component.scss']
})
export class IncomingCallDialogPopupComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string, color: string },
              public dialogRef: MatDialogRef<IncomingCallDialogPopupComponent>
  ) {

  }

  ngOnInit() {

  }

  accepted() {
    this.dialogRef.close(true);
  }
  rejected() {
    this.dialogRef.close(false);
  }

}
