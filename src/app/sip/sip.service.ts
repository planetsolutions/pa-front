import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {Application, DocType, Platforms} from '../index';
import {SipFormComponent} from './sip-form/sip-form.component';
import {TypeSelectService} from '../type/type.service';
import {Observable} from 'rxjs/Observable';
import {ApiService} from '../services/api/api.service';
import 'rxjs/add/observable/fromPromise';
import {TranslateService} from '@ngx-translate/core';
import {SipFormDataComponent} from './sip-form/data-impl/sip-form-data.component';


@Injectable()
export class SipService {


  constructor(private apiService: ApiService, private modalService: BsModalService,
              private typeSelectService: TypeSelectService, private translate: TranslateService) {
  }


  public open(docId: string, application: Application, typeId?: string, implName?: string, mode = false): Observable<string> {

     return this.openDialog(docId, typeId, application, null, mode, implName);

   }

   public create(parentFolder: string, application: Application, implName?: string, rootType = 'document',
                 typeInfo?: {id: string, title: string} ): Observable<string> {
      if (!application || application.platform === Platforms.PG) {
          if (!typeInfo) {
            return this.typeSelectService.select({
              applicationId: application ? application.uuid : null,
              rootType: rootType,
              disableAbstract: true
            })
              .flatMap((type: DocType) => {
                if (type) {
                  return this.openDialog(null, type.symbolicName, application, parentFolder, true, implName, type.title, rootType);
                } else {
                  return Observable.of(null);
                }
              });
          } else {
            return this.openDialog(null, typeInfo.id, application, parentFolder, true, implName, typeInfo.title, rootType);
          }
      } else {
          return this.openDialog(null, null, application, parentFolder, true);
      }
   }

   private openDialog(docId: string, typeId: string, application: Application, parentFolder: string, mode?: boolean, implName?: string, title = 'document.document', rootType?: string): Observable<string> {
     const bsModalRef = this.modalService.show(SipFormComponent, {
       animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-md'
     });
     const formComponent: SipFormComponent = (<SipFormComponent>bsModalRef.content);

     formComponent.docId = docId;
     formComponent.typeId = (typeId === 'cmis:folder' ? 'folder' : typeId);
     formComponent.implName = implName;
     formComponent.parentFolder = parentFolder;
     formComponent.mode = !!mode;
     formComponent.application = application;
     formComponent.baseType = (rootType === 'cmis:folder' ? 'folder' : rootType);
     formComponent.afterParamsSet();

     (<SipFormComponent>bsModalRef.content).setTitle(this.translate.instant(title));

     return formComponent.onSubmit.asObservable();
   }
}
