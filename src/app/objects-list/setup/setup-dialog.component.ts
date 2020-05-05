import {Component, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {ResultMasterPanelTabColumn} from '../../index';

@Component({
  selector: 'app-objects-list-setup-dialog',
  templateUrl: './setup-dialog.component.html'
})
export class ObjectsListSetupDialogComponent implements OnInit {
  public columns: ResultMasterPanelTabColumn[];
  public hiddenList: {};
  public onSubmit: EventEmitter<{newHiddenList: any, pageSize: any}> = new EventEmitter<{newHiddenList: any, pageSize: any}>();
  public pageSize = 0;
  public hidePages = false;

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {

  }


  public toggleColumn(index) {
    const c = this.columns[index];
    if (this.hiddenList[c.name]) {
      delete this.hiddenList[c.name];
    } else {
      this.hiddenList[c.name] = true;
    }

  }

  public submit(): void {
    this.onSubmit.emit({newHiddenList: this.hiddenList, pageSize: this.pageSize});
    this.bsModalRef.hide();

  }

}
