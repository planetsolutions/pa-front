import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {SearchFormComponent} from './search-form.component';

@Injectable()
export class SearchFormService {

  constructor(private modalService: BsModalService) { }

  public open(xform: any, title: string, defaultData: any): Observable<{query: string, formData: any}> {
    const bsModalRef = this.modalService.show(SearchFormComponent, {
      animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-lg'
    });
    const formComponent: SearchFormComponent = (<SearchFormComponent>bsModalRef.content);

    formComponent.defaultData = defaultData || {};
    formComponent.xform = xform;
    formComponent.searchTitle = title;

    return formComponent.submit.asObservable();
  }
}
