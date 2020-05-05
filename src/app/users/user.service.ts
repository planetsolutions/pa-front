import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {Observable} from 'rxjs/Observable';
import {ApiService} from '../services/api/api.service';
import 'rxjs/add/observable/fromPromise';
import {TranslateService} from '@ngx-translate/core';
import {UserInfo} from '../services/api/model/user-info';
import {UserEditComponent} from './user-edit/user-edit.component';


@Injectable()
export class UserService {


  constructor(private apiService: ApiService,
              private modalService: BsModalService, private translate: TranslateService) {
  }


  public open(userId: string): Observable<string> {

     return this.openDialog(userId);

   }

   private openDialog(userId: string): Observable<string> {
     const bsModalRef = this.modalService.show(UserEditComponent, {
       animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true
     });
     const formComponent: UserEditComponent = (<UserEditComponent>bsModalRef.content);
     formComponent.userId = userId;

     return formComponent.onSubmit.asObservable();
   }
}
