import {Component, ComponentFactoryResolver, ViewChild, Type} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {SafeUrl} from '@angular/platform-browser';
import {AppDynComponentDirective} from '../sip-form/dynamic-component-host.directive';
import {PreviewI} from './preview-i';
import {PreviewPictureComponent} from './picture-impl/preview-picture.component';
import {PreviewVideoComponent} from './video-impl/preview-video.component';
import {PreviewPdfComponent} from './pdf-impl/preview-pdf.component';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html'
})
export class PreviewDialogComponent implements PreviewI {
  public src: SafeUrl;
  public mimeType: string;
  public fileName: string;

  private subForm: PreviewI;

  @ViewChild(AppDynComponentDirective) previewContainer: AppDynComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, public bsModalRef: BsModalRef) { }

  public onAfterCreated(): any {

  }

  public afterParamsSet(): void {
    let componentType: Type<PreviewI>;

    if (this.mimeType.startsWith('image')) {
      componentType = PreviewPictureComponent;
    } else if (this.mimeType.startsWith('video')) {
      componentType = PreviewVideoComponent;
    } else if (this.mimeType === 'application/pdf') {
      componentType = PreviewPdfComponent;
    } else {
      componentType = null;
    }

    if (componentType) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);

      const viewContainerRef = this.previewContainer.viewContainerRef;

      viewContainerRef.clear();
      this.subForm = <PreviewI>viewContainerRef.createComponent(componentFactory).instance;
      this.subForm.src = this.src;
      this.subForm.fileName = this.fileName;
      this.subForm.mimeType = this.mimeType;
      this.subForm.onAfterCreated();
    }
  }


}
