import {Component} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {PreviewI} from '../preview-i';

@Component({
  selector: 'app-preview-video',
  templateUrl: './preview-video.component.html'
})
export class PreviewVideoComponent implements PreviewI {
  src: SafeUrl;
  mimeType: string;
  fileName: string;

  constructor() { }

  public onAfterCreated(): any {

  }

}
