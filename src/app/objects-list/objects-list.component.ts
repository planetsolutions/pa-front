import {Component, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {SearchResultRow} from '../services/api/model/search-result-row';
import {Application} from '../services/api/model/application';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import {ResultMasterPanelTabColumn, SortOptions} from '../services/api/model/result-master';

@Component({
  selector: 'app-objects-list',
  templateUrl: './objects-list.component.html',
  styleUrls: ['./objects-list.component.css']

})
export class ObjectsListComponent {

  @Input() set columns( value: ResultMasterPanelTabColumn[]) {
    this._columns = [];
    if (!value) return;
    this._columns = value;

  }
  @Input() set rows(value: any[]) {
    if (value) {
      this._rows = Observable.of(value);
      this.rowsCount = value.length;
    } else {
      this._rows = Observable.of(null);
      this.rowsCount = 0;
    }
  }
  get columns() {
    return this._columns;
  }
  @Input()  loading = false;
  @Input()  application: Application;
  @Input()  total;
  @Input()  page = 1;
  @Input()  pageSize = environment.itemsOnPage;
  @Input()  customizable = false;
  @Input()  checkboxes = false;
  @Input()  pagingType = PagingTypes.PAGES;
  @Input()  showMore = true;

  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() itemOpen: EventEmitter<{row: SearchResultRow, col: ResultMasterPanelTabColumn}> = new EventEmitter<{row: SearchResultRow, col: ResultMasterPanelTabColumn}>();
  @Output() sortChange: EventEmitter<SortOptions> = new EventEmitter<SortOptions>();
  @Output() selectionChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  _rows: Observable<any[]>;
  _columns: ResultMasterPanelTabColumn[];

  rowsCount = 0;
  sortedBy: string = null;
  sortedAsc = true;
  selectAllChecked = false;

  constructor(private elRef: ElementRef) {

  }

  sort(col: ResultMasterPanelTabColumn) {
    if (!col.sortable) return;

    if (this.sortedBy ===  col.name) {
      if (this.sortedAsc) {
        this.sortedAsc = false;
      } else {
        this.sortedAsc = true;
        this.sortedBy = null;
      }
    } else {
      this.sortedAsc = true;
      this.sortedBy = col.name;
    }
    this.sortChange.emit({colName: this.sortedBy, asc: this.sortedAsc});
  }

  onRowLinkClick(link: {row: SearchResultRow, col: ResultMasterPanelTabColumn, preview?: boolean}): void {
    this.itemOpen.emit(link);
  }


  onPageChange (pageNum: number): void {
    if (this.pagingType === PagingTypes.CONTINUATION) {
      this.page ++;
    } else {
      this.page = pageNum;
    }
    this.pageChange.emit(this.page);
  }

  selectAll(event: any): void {
    const chk = event.target || event.srcElement;

    this.selectAllChecked = chk.checked;

    const checks: any[] = this.elRef.nativeElement.querySelectorAll('input.objects-list-selection') || [];

    const checked = chk.checked;
    let changedAny = false;

    for (let i = 0; i < checks.length; i++) {
      if (!changedAny && checks[i].checked !== checked) {
        changedAny = true;
      }
      checks[i].checked = checked;
    }

    if (changedAny) {
      this.selected();
    }
  }

  selected(event?: any): void {
    if (event) {
      const chk = event.target || event.srcElement;
      if (!chk.checked) {
        this.selectAllChecked = false;
      }
    }
    this.selectionChange.emit(this.getSelectedIds());
  }

  private getSelectedIds(): string[] {
    const checks: any[] = this.elRef.nativeElement.querySelectorAll('input.objects-list-selection') || [];
    const ids = [].filter.call( checks, function( el ) {
      return el.checked
    }).map((el: any) => el.value);
    return ids;
  }
}

export namespace PagingTypes {
  export const PAGES = 'pages';
  export const CONTINUATION = 'continuation';
}
