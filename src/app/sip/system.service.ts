import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {DocType} from '../index';
import {SipFormComponent} from './sip-form/sip-form.component';
import {TypeSelectService} from '../type/type.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {TranslateService} from '@ngx-translate/core';
import {SipFormDataComponent} from "./sip-form/data-impl/sip-form-data.component";


@Injectable()
export class SystemService {


  constructor(private typeSelectService: TypeSelectService,
              private modalService: BsModalService, private translate: TranslateService) {
  }


  public open(itemId: string, parentId: string, mode = false): Observable<string> {

     return this.openDialog(itemId, parentId,  mode);

   }

   public create(parentId?: string): Observable<string> {
      if (!parentId) {
          return this.typeSelectService.select({
            rootType: 'abstract_system',
            disableAbstract: true})
            .flatMap((type: DocType) => {
              if (type) {
                return this.openDialog(null, type.symbolicName, true);
              } else {
                return Observable.of(null);
              }
            });

      } else {
          return this.openDialog(null, parentId, true);
      }
   }


   private openDialog(id: string, typeId: string, mode?: boolean): Observable<string> {
     const bsModalRef = this.modalService.show(SipFormComponent, {
       animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true
     });
     const formComponent: SipFormComponent = (<SipFormComponent>bsModalRef.content);
     if(typeId === 'type') {
       formComponent.implName = SipFormDataComponent.code;
     }
     formComponent.isSystem = true;
     formComponent.docId = id;
     formComponent.typeId = typeId;
     formComponent.mode = !!mode;
     formComponent.afterParamsSet();

     if (!id) {
       (<SipFormComponent>bsModalRef.content).setTitle(this.translate.instant('system.newTitle'));
     } else {
       (<SipFormComponent>bsModalRef.content).setTitle(this.translate.instant('document.document'));
     }

     return formComponent.onSubmit.asObservable();
   }
}
