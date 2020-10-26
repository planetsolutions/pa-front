import {Component} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {PreviewI} from '../preview-i';

@Component({
  selector: 'app-preview-pdf',
  templateUrl: './preview-pdf.component.html'
})
export class PreviewPdfComponent implements PreviewI {
  src: SafeUrl;
  mimeType: string;
  fileName: string;

  srcUrl: string;

  constructor(private domSanitizer: DomSanitizer) {

  }

  public onAfterCreated(): any {

    this.srcUrl = this.src['changingThisBreaksApplicationSecurity']

  }

}
