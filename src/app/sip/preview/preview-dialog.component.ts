import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {ContentData} from "../../services/api/model/content-data";
import {SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-objects-list-setup-dialog',
  templateUrl: './preview-dialog.component.html'
})
export class PreviewDialogComponent implements OnInit {
  public imgSrc: SafeUrl;
  public mimeType: string;

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {

  }



}
