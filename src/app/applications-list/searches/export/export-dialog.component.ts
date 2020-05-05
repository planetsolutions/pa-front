import {Component, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html'
})
export class ExportDialogComponent implements OnInit {

  public onSubmit: EventEmitter<{format: string, data: any}> = new EventEmitter();
  public data: any;
  public dataName: string;
  public type: string;
  public format = 'json';


  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {

  }

  public setFormat(format: string):  void {
    this.format = format;
  }

  public submit(): void {
    this.onSubmit.emit({format: this.format, data: this.data});
    this.bsModalRef.hide();

  }

}
