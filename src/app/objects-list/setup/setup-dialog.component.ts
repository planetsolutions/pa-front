import {Component, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {ResultMasterPanelTabColumn} from '../../index';
import {DisplayTypes} from '../objects-list.component';

@Component({
  selector: 'app-objects-list-setup-dialog',
  templateUrl: './setup-dialog.component.html'
})
export class ObjectsListSetupDialogComponent implements OnInit {
  public columns: ResultMasterPanelTabColumn[];
  public hiddenList: {};
  public onSubmit: EventEmitter<{newHiddenList: any, pageSize: any, autoRefresh: any, displayType: any}> = new EventEmitter<{newHiddenList: any, pageSize: any, autoRefresh: any, displayType: any}>();
  public pageSize = 0;
  public autoRefresh = 0;
  public hidePages = false;
  public displayType = '';

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
    this.onSubmit.emit({newHiddenList: this.hiddenList, pageSize: this.pageSize, autoRefresh: this.autoRefresh, displayType: this.displayType});
    this.bsModalRef.hide();

  }

  public setDisplayType(type: string) {
    if (type === DisplayTypes.TILES) {
      this.displayType = DisplayTypes.TILES;
    } else if (type === DisplayTypes.TABLE) {
      this.displayType = DisplayTypes.TABLE;
    } else {
      this.displayType = ''
    }
  }

}
