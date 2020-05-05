import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit {
  @Input()  public title: string;
  @Input()  public text: string | SafeHtml;
  @Input()  public icon: string;
  @Input()  public buttons: {label: string, theme?: string, icon?: string}[];

  public onSubmit: EventEmitter<number> = new EventEmitter<number>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  submit(btnIndex: number): void {
    this.bsModalRef.hide();
    this.onSubmit.emit(btnIndex);
  }
}
