import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {TypeSelectComponent} from './type-select/type-select.component';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {DocType} from '../services/api/model/doc-type';


@Injectable()
export class TypeSelectService {
  private subscription: Subscription;
  private modalRef: BsModalRef;

  constructor(private modalService: BsModalService) {
  }



  select(options?: {applicationId?: string, rootType?: string, disableAbstract?: boolean}): Observable<DocType> {

    return Observable.create(observer => {
        this.subscription = this.modalService.onHidden.subscribe(() => {
          const comp: TypeSelectComponent = this.modalRef.content;
          this.subscription.unsubscribe();
          if (comp.selectedType) {
            observer.next(comp.selectedType);
          } else {
            observer.next(null);
          }
          observer.complete();
        });
        this.modalRef = this.modalService.show(TypeSelectComponent, {
          animated: true, keyboard: true, backdrop: true, ignoreBackdropClick: true
        });

        this.modalRef.content.applicationId = options ? options.applicationId : null;

        if (options) {
          this.modalRef.content.rootTypeName = options.rootType;
          if (options.disableAbstract ) {
            this.modalRef.content.disableAbstract = true;
          }
        }
    });

  }


}
