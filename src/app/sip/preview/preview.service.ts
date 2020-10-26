import { Injectable } from '@angular/core';
import {BsModalService} from 'ngx-bootstrap';
import {PreviewDialogComponent} from './preview-dialog.component';
import {ContentData} from '../../services/api/model/content-data';
import {Application} from '../../services/api/model/application';
import {ApiService} from '../../services/api/api.service';
import {DomSanitizer} from '@angular/platform-browser';


@Injectable()
export class PreviewService {
  private supportedImg = ['jpg', 'jpeg', 'png', 'gif'];
  private supportedVideo = ['mp4', 'avi', 'mov', 'mkv'];
  private supportedPDF = ['pdf'];

  constructor(private apiService: ApiService, private modalService: BsModalService, private sanitizer: DomSanitizer) {
  }


  public isPreviewSupported(fileNameOrMime: string): boolean {
    const filename = fileNameOrMime;
    if (filename && filename.indexOf && filename.indexOf('.') > -1 ) {
      const ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
      if (this.supportedImg
          .concat(this.supportedVideo)
          .concat(this.supportedPDF)
          .indexOf(ext) > -1) {
        return true;
      }
    }
    return false;
  }

  public launch(id: string, fileName: string) {
    const bsModalRef = this.modalService.show(PreviewDialogComponent, {
      animated: true, keyboard: true, backdrop: true, ignoreBackdropClick: false, class: 'modal-lg'
    });
    const formComponent: PreviewDialogComponent = (<PreviewDialogComponent>bsModalRef.content);
    formComponent.src = this.sanitizer.bypassSecurityTrustUrl(this.apiService.getDocumentContentUrl(id));
    formComponent.fileName = fileName;

    const ext = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
    if (this.supportedImg.indexOf(ext) > -1) {
      formComponent.mimeType = 'image/' + ext;
    } else if (this.supportedVideo.indexOf(ext) > -1) {
      formComponent.mimeType = 'video/' + ext;
    } else if (this.supportedPDF.indexOf(ext) > -1) {
      formComponent.mimeType = 'application/pdf';
    } else {
      console.exception('Unknow mime type: ' + fileName);
      formComponent.mimeType = '';
    }

    formComponent.afterParamsSet();

    //this.apiService.getDocumentContent(id).subscribe((file: ContentData) => {
      //formComponent.src = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file.blob));
    //});
  }

}
