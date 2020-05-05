import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SearchResultRow} from '../../services/api/model/search-result-row';
import {ResultMasterColumnTypes, ResultMasterPanelTabColumn} from '../../services/api/model/result-master';

import {TranslateService} from '@ngx-translate/core';
import {DateFormatPipe} from '../../pipes/date-format.pipe';
import {DateTimeFormatPipe} from '../../pipes/date-time-format.pipe';

@Component({
  selector: 'app-objects-list-cell',
  templateUrl: './objects-list-cell.component.html',
  styleUrls: ['./objects-list-cell.component.css']
})
export class ObjectsListCellComponent implements OnInit {

  private _row: SearchResultRow;
  private _col: ResultMasterPanelTabColumn;

  public isLink: boolean;
  public isIcon: boolean;
  public value: string;
  public valueClass = '';
  public iconName;

  @Input() set row(value: SearchResultRow) {
    this._row = value;
    this.initCell();
  }
  @Input() set column(value: any) {
    this._col = value;
    this.initCell();
  }

  get column() {
    return this._col;
  }

  @Output() linkClick: EventEmitter<{row: SearchResultRow, col: ResultMasterPanelTabColumn}> = new EventEmitter<{row: SearchResultRow, col: ResultMasterPanelTabColumn}>();

  constructor(private datePipe: DateFormatPipe, private dateTimePipe: DateTimeFormatPipe, private translate: TranslateService) { }

  ngOnInit() {
  }

  private initCell() {
    if (!this._row || !this._col){ return };
    const colType = this._col.type ? this._col.type.toUpperCase() : undefined;
    const colDataType = this._col.dataType ? this._col.dataType.toUpperCase() : undefined;

    this.isLink = this._col.link;
    this.isIcon = colDataType === ResultMasterColumnTypes.ICON;
    let val: any = this._row.get(this._col.name).value;
    if (val && val !== '') {

      if (colType === ResultMasterColumnTypes.DATETIME || colDataType === ResultMasterColumnTypes.DATETIME) {
        val = this.dateTimePipe.transform(new Date(val), {format: this._col.format});
        this.valueClass = 'small';
      } else if (colType === ResultMasterColumnTypes.DATE || colDataType === ResultMasterColumnTypes.DATE) {
        val = this.datePipe.transform(new Date(val), {format: this._col.format});
        this.valueClass = 'small';
      } else if (colDataType === ResultMasterColumnTypes.CONTENT || colType === ResultMasterColumnTypes.CONTENT) {
        val = this.translate.instant('document.attachments.download');
      } else if (colDataType === ResultMasterColumnTypes.ICON) {
        if (this._col.value) {
          this.iconName = this._col.value[val] || this._col.value['default'] || null;
        }
      }
      this.value = val;
    } else if (colDataType === ResultMasterColumnTypes.ICON && !this._col.value) {

      this.value = 'empty';
    }
  }

  public onLinkClick() {
    this.linkClick.emit({row: this._row, col: this._col});
  }


}
