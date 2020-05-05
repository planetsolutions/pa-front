import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {Observable} from 'rxjs/Observable';
import {ApiService} from '../services/api/api.service';
import 'rxjs/add/observable/fromPromise';
import {TranslateService} from '@ngx-translate/core';
import {GroupEditComponent} from './group-edit/group-edit.component';


@Injectable()
export class GroupService {


  constructor(private apiService: ApiService,
              private modalService: BsModalService, private translate: TranslateService) {
  }

  public create(): Observable<string> {

    return this.openDialog();

  }

  public open(groupId: string): Observable<string> {

     return this.openDialog(groupId);

   }

   private openDialog(groupId?: string): Observable<string> {
     const bsModalRef = this.modalService.show(GroupEditComponent, {
       animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true
     });
     const formComponent: GroupEditComponent = (<GroupEditComponent>bsModalRef.content);
     if (groupId) {
       formComponent.groupId = groupId;
     }

     return formComponent.onSubmit.asObservable();
   }
}
