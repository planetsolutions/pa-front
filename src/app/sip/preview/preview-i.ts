import {EventEmitter} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';

export interface PreviewI {
  src: SafeUrl;
  mimeType: string;
  fileName: string;

  onAfterCreated(): void;
}

