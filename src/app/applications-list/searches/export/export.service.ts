import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ApiService} from '../../../services/api/api.service';
import {BsModalService} from 'ngx-bootstrap';
import {ExportDialogComponent} from './export-dialog.component';

@Injectable()
export class ExportService {


  constructor(private apiService: ApiService, private modalService: BsModalService) {

  }


  openDialog(params: {type: string, data: string | string[], dataName?: string}): void {
    const bsModalRef = this.modalService.show(ExportDialogComponent, {
      animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-md'
    });
    const formComponent: ExportDialogComponent = (<ExportDialogComponent>bsModalRef.content);
    formComponent.type = params.type;
    formComponent.data = params.data;
    formComponent.dataName = params.dataName;

    formComponent.onSubmit.subscribe((exportParams: {format: string, data: any}) => {
      console.log('Export start...');
      this.apiService.exportData(exportParams.data.compositionId, exportParams.format, exportParams.data);
    });
  }

}

export namespace ExportTypes {
  export const EXPORT_SELECTED = 'selected';
  export const EXPORT_FOLDER = 'folder';
  export const EXPORT_SEARCH = 'search';
  export const EXPORT_FTSEARCH = 'ftsearch';
}

