import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {Observable} from 'rxjs/Observable';
import {ApiService} from '../services/api/api.service';
import {TypeSelectService} from '../type/type.service';
import {Application, DocType} from '../index';
import 'rxjs/add/observable/fromPromise';
import {TranslateService} from '@ngx-translate/core';
import {FolderEditDialogComponent} from './folder-edit-dialog/folder-edit-dialog.component';

@Injectable()
export class FolderService {

  constructor(private typeSelectService: TypeSelectService, private modalService: BsModalService) { }


  public open(folderId: string): Observable<string> {

    return this.openDialog(folderId);

  }

  public create(parentFolder?: string, application?: Application): Observable<string> {
    return this.typeSelectService.select({
      applicationId: application ? application.uuid : null,
      rootType: 'folder',
      disableAbstract: true
    })
      .flatMap((type: DocType) => {
        if (type) {
          return this.openDialog(null, type.symbolicName, parentFolder);
        } else {
          return Observable.of(null);
        }
      });
  }

  private openDialog(folderId: string, typeId?: string, parentFolder?: string): Observable<string> {
    const bsModalRef = this.modalService.show(FolderEditDialogComponent, {
      animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true
    });
    const formComponent: FolderEditDialogComponent = (<FolderEditDialogComponent>bsModalRef.content);

    formComponent.folderId = folderId;
    formComponent.parentFolder = parentFolder;
    formComponent.typeId = typeId;
    formComponent.afterParamsSet();

    return formComponent.onSubmit.asObservable();
  }
}
