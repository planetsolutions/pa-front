import { Injectable } from '@angular/core';
import {BsModalService} from 'ngx-bootstrap';
import {PreviewDialogComponent} from './preview-dialog.component';
import {ContentData} from '../../services/api/model/content-data';
import {Application} from '../../services/api/model/application';
import {ApiService} from '../../services/api/api.service';
import {DomSanitizer} from '@angular/platform-browser';


@Injectable()
export class PreviewService {

  constructor(private apiService: ApiService, private modalService: BsModalService, private sanitizer: DomSanitizer) {
  }

  public isPreviewSupported(fileNameOrMime: string): boolean {
    const supported = ['jpg', 'jpeg', 'png', 'gif'];
    const filename = fileNameOrMime;
    if (filename && filename.indexOf && filename.indexOf('.') > -1 ) {
      const ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
      if (supported.indexOf(ext) > -1) {
        return true;
      }
    }
    return false;
  }

  public launch(id: string, application: Application) {
    const bsModalRef = this.modalService.show(PreviewDialogComponent, {
      animated: true, keyboard: true, backdrop: true, ignoreBackdropClick: false, class: 'modal-lg'
    });
    const formComponent: PreviewDialogComponent = (<PreviewDialogComponent>bsModalRef.content);

    this.apiService.getDocumentContent(id).subscribe((file: ContentData) => {
      formComponent.imgSrc = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file.blob));
    });
  }

}
