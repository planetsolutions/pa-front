import {Component, Input, AfterViewInit, EventEmitter, Output} from '@angular/core';
import {UserInfo, Tenant, AccessGroup} from '../../index';
import {BsModalService} from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {ApiService} from '../../services/api/api.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  providers: [BsModalService]
})
export class UserEditComponent implements AfterViewInit {
  user: UserInfo = new UserInfo({});

  tenants: Tenant[];
  groups: AccessGroup[];
  langs: string[] = [];

  groupsChk: ListElement[];

  @Input() set userId(userId: string){
    this.loadData(userId);
  }

  @Output() onSubmit: EventEmitter<string> = new EventEmitter<string>();

  constructor(public bsModalRef: BsModalRef, private apiService: ApiService) { }

  private loadData (userId: string): void {
    const task1: Observable<AccessGroup[]> = this.apiService.getGroups();
    const task2: Observable<Tenant[]> = this.apiService.getTenants();
    const task3: Observable<UserInfo> = this.apiService.getUser(userId);

    Observable.forkJoin(task1, task2, task3).subscribe((result: [AccessGroup[], Tenant[], UserInfo ] ) => {
      this.groups = result[0];
      this.tenants = result[1];
      this.user = result[2];

      this.groupsChk = this.groups.map((gr: AccessGroup) => new ListElement(gr.title, gr.id, this.user.groups.indexOf(gr.id) > -1 ));
    });
  }

  ngAfterViewInit(): void {
    this.langs = this.apiService.getSupportedLangs();
  }


  ok() {
    this.user.groups = this.groupsChk.filter((gr: ListElement) => gr.checked).map((gr: ListElement) => gr.value);
    this.apiService.saveUser(this.user).subscribe(() => {
      this.onSubmit.emit(this.user.id);
      this.bsModalRef.hide();
    });
  }

  checkBoxClick(i) {
    this.groupsChk[i].checked = !this.groupsChk[i].checked;
  }

}


class ListElement {
  public name: string;
  public value: string;
  public checked: boolean;

  constructor(name: string, value: string, checked = false) {
    this.name = name;
    this.value = value;
    this.checked = checked;
  }
}
