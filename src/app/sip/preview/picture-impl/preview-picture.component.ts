import {Component} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {PreviewI} from '../preview-i';

@Component({
  selector: 'app-preview-picture',
  templateUrl: './preview-picture.component.html'
})
export class PreviewPictureComponent implements PreviewI {
  src: SafeUrl;
  mimeType: string;
  fileName: string;

  constructor() { }

  public onAfterCreated(): any {

  }

}
