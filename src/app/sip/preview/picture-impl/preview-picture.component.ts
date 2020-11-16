import {Component, Input} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {PreviewI} from '../preview-i';

@Component({
  selector: 'app-preview-picture',
  templateUrl: './preview-picture.component.html'
})
export class PreviewPictureComponent implements PreviewI {
  @Input() src: SafeUrl;
  @Input() mimeType: string;
  @Input() fileName: string;
  @Input() height: string;

  constructor() { }

  public onAfterCreated(): any {

  }

}
