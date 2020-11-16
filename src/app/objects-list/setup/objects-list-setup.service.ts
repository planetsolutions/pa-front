import { Injectable } from '@angular/core';
import {ResultMasterPanelTabColumn} from '../../index';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../services/api/auth.service';
import {Subject} from 'rxjs/Subject';
import {BsModalService} from 'ngx-bootstrap';
import {ObjectsListSetupDialogComponent} from './setup-dialog.component';
import {environment} from '../../../environments/environment';
import {DisplayTypes} from '../objects-list.component';

@Injectable()
export class ObjectsListSetupService {

  private columns: ResultMasterPanelTabColumn[];
  private hiddenList = {};
  private pageSize = 0;
  private autoRefresh = 0;
  private displayType: string;
  private subscription: Subject<{columns: ResultMasterPanelTabColumn[], pageSize: number, autoRefresh: number, displayType: string}> = new Subject<{columns: ResultMasterPanelTabColumn[], pageSize: number, autoRefresh: number, displayType: string}>();

  constructor(private authService: AuthService, private modalService: BsModalService) {
    this.hiddenList = this.authService.getHiddenColumns() || {};
    this.pageSize = this.authService.getPageSize() || environment.itemsOnPage;
    this.autoRefresh = this.authService.getAutoRefresh() || environment.autoRefresh;
    this.displayType = this.authService.getDisplayType();
  }

  private transformColumns(): ResultMasterPanelTabColumn[] {

      const arr = this.columns.filter((c) => (this.hiddenList[c.name] && !c.required) ? false : true);
      return arr;
  }

  setColumns(cols: ResultMasterPanelTabColumn[]): Observable<{columns: ResultMasterPanelTabColumn[], pageSize: number, autoRefresh: number, displayType: string}> {
    this.columns = cols;

    this.subscription.next({columns: this.transformColumns(), pageSize: this.pageSize, autoRefresh: this.autoRefresh, displayType: this.displayType });

    return this.subscription;
  }

  getDispColumns(): Subject<{columns: ResultMasterPanelTabColumn[], pageSize: number, autoRefresh: number, displayType: string}> {
    return this.subscription;
  }

  changeSettings(hidePages = false) {
    const bsModalRef = this.modalService.show(ObjectsListSetupDialogComponent, {
      animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-md'
    });
    const formComponent: ObjectsListSetupDialogComponent = (<ObjectsListSetupDialogComponent>bsModalRef.content);

    formComponent.hiddenList = this.hiddenList;
    formComponent.columns = this.columns;
    formComponent.pageSize = this.pageSize;
    formComponent.autoRefresh = this.autoRefresh;
    formComponent.hidePages = hidePages;
    formComponent.displayType = this.displayType;
    formComponent.onSubmit.subscribe((value: {newHiddenList: any, pageSize: number, autoRefresh: number, displayType: string}) => {
      this.hiddenList = value.newHiddenList;
      this.pageSize = value.pageSize;
      this.autoRefresh = value.autoRefresh;
      this.displayType = value.displayType;
      this.authService.setHiddenColumns(this.hiddenList);
      this.authService.setPageSize(this.pageSize);
      this.authService.setAutoRefresh(this.autoRefresh);
      this.authService.setDisplayType(this.displayType);
      this.subscription.next({columns: this.transformColumns(), pageSize: this.pageSize, autoRefresh: this.autoRefresh, displayType: this.displayType});
    });
  }

}
