import { Component, OnInit } from '@angular/core';
import {CmisObject, ResultMasterColumnTypes, PagedList, SearchResultRow,
  CmisConstants, ResultMasterPanelTabColumn, SortOptions} from '../../index';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '../../services/api/api.service';
import {SipService} from '../../sip/sip.service';
import {FolderService} from '../folder.service';
import {SystemService} from '../../sip/system.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-folders-manage',
  templateUrl: './folders-manage.component.html'
})
export class FoldersManageComponent implements OnInit {
  public selectedFolder: CmisObject;
  private selectedFolderPath: CmisObject[];
  public dataColumns = [];
  private folderData: CmisObject[];
  public pageNum = 1;
  public dataRows: SearchResultRow[];
  public dataTotalCount = 0;
  public isLoading = false;

  private sortOptions: SortOptions;

  breadCrumbs: {name: string, id: string, func?: any}[] = [];

  constructor(private apiService: ApiService, private sipService: SipService, private systemService: SystemService,
              private folderService: FolderService, private translate: TranslateService) { }

  ngOnInit() {
    this.translate.get('applications.root').subscribe((rootName: string) => {
      this.dataColumns = [
        {
          name: 'id',
          label: this.translate.instant('search.data.id'),
          hidden: false,
          type: ResultMasterColumnTypes.STRING,
          sortable: false
        },
        {
          name: CmisConstants.CMIS_PROP_NAME,
          label: this.translate.instant('search.data.title'),
          hidden: false,
          type: ResultMasterColumnTypes.STRING,
          sortable: true,
          link: true
        },
        {
          name: CmisConstants.CMIS_PROP_BASETYPE,
          label: this.translate.instant('search.data.baseType'),
          hidden: false,
          type: ResultMasterColumnTypes.STRING,
          sortable: true
        },
        {
          name: 'type',
          label: this.translate.instant('search.data.type'),
          hidden: false,
          type: ResultMasterColumnTypes.STRING,
          sortable: false
        },
        {
          name: CmisConstants.CMIS_PROP_MODIFIED,
          label: this.translate.instant('search.data.modified'),
          hidden: false,
          type: ResultMasterColumnTypes.DATETIME,
          sortable: true
        }
      ];
      this.loadFolderContents();
    });
  }

  onFolderSelected(folders: CmisObject[]) {
    this.selectedFolder = folders[0];
    this.loadFolderContents(this.selectedFolder.id);
    this.selectedFolderPath = folders;
    this.breadCrumbs = [];

    const that = this;

    for (let i = folders.length - 1; i >= 0; i--) {
      this.putBreadCrumb({name: folders[i].name, id: folders[i].id, func: (i === 0 ? null : function (index: number) {
        const bc = that.breadCrumbs[index];

        const newFolders = that.selectedFolderPath.slice(folders.length - index - 1);

        that.onFolderSelected(newFolders);

      })
      }, true);
    }
  }

  public refresh(): void {
    this.loadFolderContents(this.selectedFolder ? this.selectedFolder.id : undefined);
  }

  public onItemOpen(link: {row: SearchResultRow, col: ResultMasterPanelTabColumn}) {

      for (let i = 0; i < this.folderData.length; i++) {
        if (this.folderData[i].id === link.row.id) {
          if (this.folderData[i].baseType === CmisConstants.CMIS_TYPE_FOLDER) {
            let foldersPath = [this.folderData[i]];
            if (this.selectedFolderPath && this.selectedFolderPath.length > 0) {
              foldersPath = foldersPath.concat(this.selectedFolderPath);
            }
            this.onFolderSelected(foldersPath);
          } else {
            this.sipService.open(this.folderData[i].id, null).subscribe(() => {
                this.refresh();
            });
          }
          return;
        }
      }
  }


  public createDocument() {
    this.sipService.create(this.selectedFolder ? this.selectedFolder.id : null, null)
      .subscribe((id: string) => {
      if (id) {
        this.refresh();
      }
    });
  }

  public createSystem() {
    this.systemService.create() // this.selectedFolder ? this.selectedFolder.id : null)
      .subscribe((id: string) => {
        if (id) {
          this.refresh();
        }
      });
  }

  public createFolder() {
    this.folderService.create(this.selectedFolder ? this.selectedFolder.id : null)
      .subscribe((id: string) => {
        if (id) {
          this.refresh();
        }
      });
  }

  public editFolder() {
    this.folderService.open(this.selectedFolder.id);
  }


  public onItemsPageChange(pageNum: number): void {
    this.pageNum = pageNum;
    this.refresh();
  }

  public onSort(options: SortOptions) {
    this.sortOptions = options;
    this.onItemsPageChange(1);
  }

  private mapCmisObjectToResultSet(obj: CmisObject) {
    const row: any = {id: obj.id};
    row.columns = [];
    row.columns.push({name: 'id', value: obj.id});
    row.columns.push({name: CmisConstants.CMIS_PROP_NAME, value: obj.name});
    row.columns.push({name: CmisConstants.CMIS_PROP_BASETYPE, value: obj.baseType});
    row.columns.push({name: 'type', value: obj.type});
    row.columns.push({name: CmisConstants.CMIS_PROP_MODIFIED, value: obj.lastModified});
    return new SearchResultRow(row);
  }

  private loadFolderContents(folderId?: string): void {
    this.isLoading = true;
    this.apiService.getCmisData(folderId, null, 0, this.pageNum,
      this.sortOptions && this.sortOptions.colName ? this.sortOptions : null )
      .catch((err) => {alert(err); return Observable.of(null) })
      .subscribe((page: PagedList<CmisObject>) => {
      this.isLoading = false;
      this.folderData = page ? page.data : null;
      this.dataTotalCount = page ? page.total : 0;
      this.dataRows = page ? page.data.map((obj: CmisObject) =>
        this.mapCmisObjectToResultSet(obj)
      ) : null;
    });
  }

  private putBreadCrumb(crumb: {name: string, id: string, func?: any}, append = false ) {
    if (append) {
      this.breadCrumbs.push(crumb);
    } else {
      this.breadCrumbs = [crumb];
    }
  }
}
