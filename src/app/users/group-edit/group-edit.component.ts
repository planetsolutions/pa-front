import {Component, Input, AfterViewInit, EventEmitter, Output} from '@angular/core';
import {AccessGroup} from '../../index';
import {BsModalService} from 'ngx-bootstrap';
import {BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {ApiService} from '../../services/api/api.service';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  providers: [BsModalService]
})
export class GroupEditComponent {
  group: AccessGroup = new AccessGroup({});
  isNew = true;
  @Input() set groupId(groupId: string){
   this.isNew = false;
   this.apiService.getGroup(groupId).subscribe((g: AccessGroup) => this.group = g);
  }

  @Output() onSubmit: EventEmitter<string> = new EventEmitter<string>();

  constructor(public bsModalRef: BsModalRef, private apiService: ApiService) { }

  ok() {
    this.apiService.saveGroup(this.group, this.isNew).subscribe((group: AccessGroup) => {
      this.onSubmit.emit(group.id);
      this.bsModalRef.hide();
    });
  }
}
