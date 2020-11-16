import {Component, Input} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {PreviewI} from '../preview-i';

@Component({
  selector: 'app-preview-video',
  templateUrl: './preview-video.component.html'
})
export class PreviewVideoComponent implements PreviewI {
  @Input()  src: SafeUrl;
  @Input()  mimeType: string;
  @Input()  fileName: string;

  constructor() { }

  public onAfterCreated(): any {

  }

}
