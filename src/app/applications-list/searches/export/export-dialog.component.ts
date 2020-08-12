import {Component, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {SystemDoc} from "../../../services/api/model/system-doc";

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html'
})
export class ExportDialogComponent implements OnInit {

  public onSubmit: EventEmitter<{format: string, formatType: string, data: any}> = new EventEmitter();
  public data: any;
  public dataName: string;
  public type: string;
  public format: string;
  public formatType: string;
  public exports: SystemDoc[];
  public isLoading = false;
  public result: any;

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {

  }

  public setFormat(format: string, formatType: string):  void {
    this.format = format;
    this.formatType = formatType;
  }

  public submit(): void {
    this.onSubmit.emit({format: this.format, formatType: this.formatType, data: this.data});
    this.setLoading(true);
  }

  public setLoading(loading: boolean) {
    this.isLoading = loading
  }

  public hide(): void {
    this.bsModalRef.hide();
  }

  public setResult(result: any): void {
    this.result = JSON.stringify(result);
  }

}
