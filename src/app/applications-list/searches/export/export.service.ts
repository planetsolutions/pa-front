import { Injectable } from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {BsModalService} from 'ngx-bootstrap';
import {ExportDialogComponent} from './export-dialog.component';
import {SystemDoc} from '../../../services/api/model/system-doc';
import {Application} from '../../../services/api/model/application';
import {Observable} from 'rxjs/Observable';
import {AlertsService} from '../../../alerts/alerts.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class ExportService {


  constructor(private apiService: ApiService, private modalService: BsModalService, private alertService: AlertsService, private translate: TranslateService) {

  }


  openDialog(params: {application: Application, type: string, data: string | string[], dataName?: string}): void {
    const bsModalRef = this.modalService.show(ExportDialogComponent, {
      animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-md'
    });
    const formComponent: ExportDialogComponent = (<ExportDialogComponent>bsModalRef.content);
    formComponent.type = params.type;
    formComponent.data = params.data;
    formComponent.dataName = params.dataName;
    formComponent.exports = [];

    const task1: Observable<SystemDoc[]> = this.apiService.getSystemDocs('client_export_config', true);
    const task2: Observable<SystemDoc[]> = this.apiService.getSystemDocs('server_shell_export_config', true);
    Observable.forkJoin(task1, task2)
      .subscribe((result: [SystemDoc[], SystemDoc[]]) => {
        const data: SystemDoc[] = result[0].concat(result[1]);
        if (data && data.length > 0) {
          formComponent.exports = data.filter((doc: SystemDoc) => {
            if (doc.data.enabled && doc.data.enabled === 1) {
              if (doc.data.shared === 1 || (doc.symbolicName && (
                params.application.exports.lastIndexOf(doc.symbolicName) > -1
                || params.application.exports.lastIndexOf(doc.symbolicName.toLowerCase()) > -1
                ))) {
                return true;
              }
            }
            return false;
          });
        }
      });

    formComponent.onSubmit.subscribe((exportParams: {format: string, formatType: string, data: any}) => {
      console.log('Export start...' + exportParams.format + ' - ' + exportParams.formatType);
      this.apiService.exportData(exportParams.format, exportParams.formatType, exportParams.data)
        .subscribe((value: any) => {
          formComponent.setLoading(false);
          formComponent.hide();
          if (value) {
            formComponent.setResult(value);
            let msg: string = value.message;
            if (msg.indexOf('/') > -1) {
              msg = this.translate.instant('export.result.info', {succeeded: msg.split('/')[0], failed: msg.split('/')[1]})
            }

            if (value.errorOccured) {
              this.alertService.error({error: msg})
            } else {
              this.alertService.info({text: msg, title: 'export.title'})
            }
          }
        });
    });
  }

}

export namespace ExportTypes {
  export const EXPORT_SELECTED = 'selected';
  export const EXPORT_FOLDER = 'folder';
  export const EXPORT_SEARCH = 'search';
  export const EXPORT_FTSEARCH = 'ftsearch';
}

