import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SearchResultRow} from '../../services/api/model/search-result-row';
import {ResultMasterColumnTypes, ResultMasterPanelTabColumn} from '../../services/api/model/result-master';

import {TranslateService} from '@ngx-translate/core';
import {DateFormatPipe} from '../../pipes/date-format.pipe';
import {DateTimeFormatPipe} from '../../pipes/date-time-format.pipe';
import {DomSanitizer} from '@angular/platform-browser';
import {PreviewService} from '../../sip/preview/preview.service';

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
  public iconStyle;
  public valueStyle;
  public previewSupported: boolean;


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

  @Output() linkClick: EventEmitter<{row: SearchResultRow, col: ResultMasterPanelTabColumn,
    preview?: boolean}> = new EventEmitter<{row: SearchResultRow, col: ResultMasterPanelTabColumn, preview?: boolean}>();

  constructor(private datePipe: DateFormatPipe, private dateTimePipe: DateTimeFormatPipe,
              private translate: TranslateService, private preview: PreviewService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  private initCell() {
    if (!this._row || !this._col) { return };
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

        if (this.preview.isPreviewSupported(val)) {
          this.previewSupported = true;
        }

        if (this._col.value) {
          const colConfig: any = this._col.value[val] || this._col.value['default'] || null;
          if (colConfig != null) {
              this.iconName = colConfig;
          }
        }
      }

      this.value = val;

      if (this._col['style']) {
        const colStyleConfig: any = this._col['style'];
        if (typeof(colStyleConfig) === 'string') {
          this.valueStyle = this.sanitizer.bypassSecurityTrustStyle(colStyleConfig);
        } else {
          for (const style in colStyleConfig) {
            if (this.compileTemplate(colStyleConfig[style])) {
              this.valueStyle = this.sanitizer.bypassSecurityTrustStyle(style);
              break;
            }
          }
        }
      }
    } else if (colDataType === ResultMasterColumnTypes.ICON && !this._col.value) {
      this.value = 'empty';
    }
  }

  public onLinkClick() {
     this.linkClick.emit({row: this._row, col: this._col});
  }

  public onIconClick() {
    if (this.previewSupported) {
        this.linkClick.emit({row: this._row, col: this._col, preview: true});
    }
  }

  private compileTemplate(templateString) {
      return new Function('var row = this.row; var value = this.value; return (' + templateString + ');')
        .call({row: this._row, value: this.value});
  }


}
