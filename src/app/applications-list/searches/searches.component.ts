import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Search, SearchComposition, Application, ResultMaster, ResultMasterColumnTypes, SortOptions,
  ResultMasterPanelTabColumn, Platforms, CmisConstants, SearchResultRow, SearchResultRowColumn,
  CmisObject, PagedList, XForm, Doc } from '../../index';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/interval';
import {Observable} from 'rxjs/Observable';
import {ApiService} from '../../services/api/api.service';
import {CommunicationService} from '../../services/communication.service';
import {SipService} from '../../sip/sip.service';
import {TranslateService} from '@ngx-translate/core';
import {SearchFormService} from './search-form/search-form.service';
import {ObjectsListSetupService} from '../../objects-list/setup/objects-list-setup.service';
import {ExportService, ExportTypes} from './export/export.service';
import {AlertsService} from '../../alerts/alerts.service';
import {Subscription} from 'rxjs/Subscription';
import {PagingTypes} from '../../objects-list/objects-list.component';
import {DisplayTypes} from '../../objects-list/objects-list.component';
import {PreviewService} from '../../sip/preview/preview.service';
import {environment} from '../../../environments/environment';
import {DropzoneConfigInterface, DropzoneDirective} from 'ngx-dropzone-wrapper';
import {DNDImportService} from './dnd-import/dnd-import.service';


@Component({
  selector: 'app-searches',
  templateUrl: './searches.component.html',
  styleUrls: ['./searches.component.css'],
  animations: [
    trigger('panelWidthTrigger', [
      state('expanded', style({ width: '220px' })),
      state('collapsed', style({ width: '30px' })),
      transition('collapsed => expanded', animate('200ms ease-in')),
      transition('expanded => collapsed', animate('200ms 200ms ease-out'))
    ]),
    trigger('bodyMarginTrigger', [
      state('expanded', style({ marginLeft: '230px' })),
      state('collapsed', style({ marginLeft: '40px' })),
      transition('collapsed => expanded', animate('200ms ease-in')),
      transition('expanded => collapsed', animate('200ms 200ms ease-out'))
    ])
  ]
})
export class SearchesComponent implements OnInit, OnDestroy {
  public application: Application;
  public loadingSearches = true;
  public searches: Search[] = [];
  public selectedSearch: Search;
  public lastSelectedSearch: Search;
  public selectedFolder: CmisObject;
  private selectedFolderPath: CmisObject[];
  public lastSelectedFolderPath: CmisObject[];
  private selectedSearchComposition: SearchComposition;
  public xForm: XForm;
  public setupDisp = null;
  public dataRows: SearchResultRow[];
  public dataTotalCount = -1;
  public dataTotalCountLoading = false;
  public rootId: string = null;
  public platforms = Platforms;
  public isLoading = false;
  public tab1Active = true;
  public tab2Active = false;
  public dropZoneConfig: DropzoneConfigInterface = {clickable: false, autoQueue: false, autoProcessQueue: false, createImageThumbnails: false};
  private folderData: CmisObject[];
  private pageNum = 1;
  private currentSearchRequest: string;
  private currentSearchFormData: any;
  private rootFolderColumns: ResultMasterPanelTabColumn[];
  private sortOptions: SortOptions;
  private defaultSortOptions: SortOptions;
  private selectedRowsIds: string[];
  private onColChangeSubs: Subscription;
  private pagingType: string;
  private displayType: string;
  private displayTypeRoot: string;
  private isLastPage = false;
  private autoRefreshTask: Subscription = null;
  private rootFolder: Doc;
  private dndEventActive = false;

  breadCrumbs: { name: string, id: string, func?: any }[] = [];

  pageSize = 0;

  expanded = true;
  expandedState = 'expanded';
  menuMaxHeight = 0;
  ftQuery = '';
  ftAggregations: any;

  @ViewChild(DropzoneDirective)
  private directiveRef?: DropzoneDirective;

  constructor(private apiService: ApiService, private exportService: ExportService, private alertService: AlertsService,
              private route: ActivatedRoute, private listSetupService: ObjectsListSetupService,
              private sipService: SipService, private searchFormService: SearchFormService,
              private communicationService: CommunicationService, private translate: TranslateService,
              private previewService: PreviewService, private dndImportService: DNDImportService) {
  }

  ngOnInit() {
    const retrieveAppId = this.route.params.first()
      .map((params) => params['app_uuid']);

    retrieveAppId.flatMap((appId: string) => this.apiService.getApplicationInfo(appId))
      .subscribe((application: Application) => {
        this.application = application;
        this.communicationService.set('application', this.application);

        retrieveAppId.flatMap((appId: string) =>
          this.apiService.getApplicationSearches(appId)
        ).subscribe(
          (search) => {
            this.searches.push(search);
            this.loadingSearches = false;
          },
          null,
          () => {
            this.loadingSearches = false;
            if (this.searches.length > 0) {
              this.selectSearch(this.searches[0], true);
            }
          }
        );
      });

    if (window.innerWidth < environment.minScreenSize) {
      this.expanded = false;
      this.expandedState = 'collapsed';
    }

    this.calcHeight();

    this.onColChangeSubs = this.listSetupService.getDispColumns().subscribe((setup) => {
      this.setupDisp = setup;
      if (setup.displayType && setup.displayType !== '') {
        this.displayType = setup.displayType;
      } else if (this.displayTypeRoot && this.displayTypeRoot !== '') {
        this.displayType = this.displayTypeRoot;
      } else {
        this.displayType = this.calcDisplayType();
      }
      this.onItemsPageChange(1);
    });

  }

  ngOnDestroy(): void {
    if (this.onColChangeSubs) {
      this.onColChangeSubs.unsubscribe();
    }
  }

  toggleExpandedState() {
    this.expandedState = this.expanded ? 'collapsed' : 'expanded';
    this.expanded = !this.expanded;
  }


  selectSearch(search: Search, noContent = false) {
    if (this.selectedSearch && this.selectedSearch.uuid === search.uuid) { return; }
    this.lastSelectedSearch = JSON.parse(JSON.stringify(search));
    this.ftQuery = '';
    this.selectedFolder = null;
    this.selectedFolderPath = null;
    this.xForm = null;
    this.currentSearchFormData = null;
    this.dataRows = null;
    this.dataTotalCount = -1;
    this.pageNum = 1;
    this.sortOptions = undefined;
    this.isLoading = true;
    // this.communicationService.set('search-form-xform', Observable.of(null));
    this.selectedSearch = search;
    this.currentSearchRequest = null;
    this.currentSearchFormData = null;

    this.apiService.getSearchCompositions(search.uuid).first()
      .subscribe((sc: SearchComposition) => {
        this.selectedSearchComposition = sc;

        if (sc.xformUUID === null) {
          this.isLoading = false;
          return Observable.empty();
        }

        this.apiService.getXform(sc.xformUUID).subscribe((form: XForm) => {
          this.xForm = form;
          if (form.searchData.pagination === false) {
            this.pagingType = PagingTypes.CONTINUATION;
          } else {
            this.pagingType = PagingTypes.PAGES;
          }

          this.apiService.getResultMaster(sc.resultMasterUUID)
            .subscribe((v: ResultMaster) => {
              const cols = v.getMainPanel().tabs[0].columns
                .filter((c: ResultMasterPanelTabColumn) => !c.hidden);
              this.initColumnsLinks(cols);
              this.listSetupService.setColumns(cols);
              if (!noContent) {
                // this.loadSearchContents();
              }
            });
        });

      });
  }

  public onTreeFolderSelected(folders: CmisObject[]) {
    this.lastSelectedFolderPath = JSON.parse(JSON.stringify(folders));
    this.selectedSearch = null;
    this.selectedFolder = folders[0];
    this.selectedFolderPath = folders;
    this.dataRows = null;
    this.folderData = [];
    this.dataTotalCount = -1;
    this.pageNum = 1;
    this.sortOptions = undefined;
    this.isLoading = true;
    this.listSetupService.setColumns(this.rootFolderColumns);
    this.ftQuery = '';
    this.ftAggregations = null;
    this.pagingType = PagingTypes.PAGES;

    this.breadCrumbs = [];

    const that = this;

    for (let i = folders.length - 1; i >= 0; i--) {
      this.putBreadCrumb({
        name: folders[i].name, id: folders[i].id, func: (i === 0 ? null : function (index: number) {
          const bc = that.breadCrumbs[index];

          const newFolders = that.selectedFolderPath.slice(folders.length - index - 1);

          that.onTreeFolderSelected(newFolders);

        })
      }, true);
    }
  }

  public onRootFolderLoaded(rootDoc: Doc) {
    this.rootId = rootDoc.id;
    this.rootFolder = rootDoc;
    if (rootDoc.data && rootDoc.data.defaultSorting && rootDoc.data.defaultSorting.colName) {
      this.defaultSortOptions = rootDoc.data.defaultSorting;
    }

    if (rootDoc.data && rootDoc.data.displayType) {
      this.displayTypeRoot = rootDoc.data.displayType;
    }
    if (rootDoc.data && rootDoc.data.fields) {
      this.rootFolderColumns = rootDoc.data.fields;
      this.initColumnsLinks(this.rootFolderColumns);
    } else {
      this.translate.get('title').subscribe(() => {
        this.rootFolderColumns = [
          <ResultMasterPanelTabColumn>{
            name: CmisConstants.CMIS_PROP_ID,
            label: this.translate.instant('search.data.id'),
            hidden: false,
            type: ResultMasterColumnTypes.STRING,
            sortable: true
          },
          <ResultMasterPanelTabColumn>{
            name: CmisConstants.CMIS_PROP_NAME,
            label: this.translate.instant('search.data.title'),
            hidden: false,
            type: ResultMasterColumnTypes.STRING,
            sortable: true,
            link: true
          },
          <ResultMasterPanelTabColumn>{
            name: CmisConstants.CMIS_PROP_TYPE,
            label: this.translate.instant('search.data.type'),
            hidden: false,
            type: ResultMasterColumnTypes.STRING,
            sortable: true
          },
          <ResultMasterPanelTabColumn>{
            name: CmisConstants.CMIS_PROP_MODIFIED,
            label: this.translate.instant('search.data.modified'),
            hidden: false,
            type: ResultMasterColumnTypes.DATETIME,
            sortable: true
          }
        ]
      })
    }
  }

  private initColumnsLinks(columns: ResultMasterPanelTabColumn[]): void {
    if (this.application.platform !== Platforms.IA) {
      // add link to columns if none were assigned in composition
      const links = columns.filter((c: ResultMasterPanelTabColumn) => c.link);
      if (links.length === 0) {
        columns.filter((c: ResultMasterPanelTabColumn) => {
          if (c.dataType !== ResultMasterColumnTypes.ICON) {
            c.link = true;
          }
          return true;
        });
      }
    } else {
      columns.filter((c: ResultMasterPanelTabColumn) => {
        if (c.type === ResultMasterColumnTypes.CONTENT) {
          c.link = true;
        }
        return true;
      });
    }
  }

  private loadSearchContents() {

    let totalCount = -1;
    let obsCountFinished = false;
    const query = this.currentSearchRequest;
    let dtResponse = new Date();

    this.apiService.executeSearch(this.selectedSearchComposition.uuid, query, this.pageNum, this.pageSize, this.sortOptions)
      .subscribe((page: PagedList<SearchResultRow>) => {
        dtResponse = new Date();
        this.isLoading = false;
        if (this.pagingType === PagingTypes.PAGES || !this.dataRows || this.pageNum === 1) {
          this.dataRows = page.data;
        } else {
          this.dataRows = this.dataRows.concat(page.data);
        }
        this.isLastPage = page.isLast;

        if (totalCount < 0 ) {
          totalCount = page.total;
          if (obsCountFinished) { // если числа нет, а числовой запрос отработал, то берем число из ответа данных
            this.dataTotalCount = totalCount;
            this.dataTotalCountLoading = false;
            if (!query || query === '') { // если поисковый запрос пустой, то подставляем настроечное значение
              if (this.xForm.searchData.default_count) {
                this.dataTotalCount = this.xForm.searchData.default_count;
              }
            }
          }
        }
        this.putBreadCrumb({name: this.selectedSearch.name, id: null});
      });

    if (!this.pageNum || this.pageNum === 1) {
      this.dataTotalCountLoading = true;
      this.dataTotalCount = 0;

      this.apiService.getSearchResultsCount(this.selectedSearchComposition.uuid, query)
          .subscribe((count) => {
            this.dataTotalCount = count;
            totalCount = count;
            this.dataTotalCountLoading = false;
            obsCountFinished = true;
          }, (err) => {
            console.log(err)
            if (totalCount > -1) { // если данные уже вернулись, то берем число от туда
              this.dataTotalCount = totalCount;
              this.dataTotalCountLoading = false;
            }
            if (!query || query === '') { // если поисковый запрос пустой, то подставляем настроечное значение
              if (this.xForm.searchData.default_count) {
                this.dataTotalCount = this.xForm.searchData.default_count;
              }
            }
            totalCount = this.dataTotalCount;
            obsCountFinished = true;
          });

    }
  }

  private getPageSize(): number {
    let pageSize = this.pageSize;
    if (this.displayType === DisplayTypes.TILES) {
      pageSize = 30;
    } else if (this.pagingType === PagingTypes.CONTINUATION) {
      pageSize = 100;
    } else {
      pageSize = this.setupDisp.pageSize;
    }
    return pageSize;
  }

  private loadFTSearchContents(filter?: {name: string, value: string}[]) {
    const params = {
      query: {

      },
      aggregations: {}
    };

    if (!filter) {
      params.query['match'] = {
        _all : this.ftQuery
      }
    } else {
      params.query['bool'] = {
        must: {
          match: {
            _all: this.ftQuery
          }
        },
        filter: {
          bool: {
            must: []
          }
        }
      }
    }

    if (this.rootFolderColumns) {
      this.rootFolderColumns.filter( (col: ResultMasterPanelTabColumn) => {
        if (col.faceted) {
          params.aggregations[col.label] =  {
            terms: {field: 'data.' + col.name + '.keyword'}
          }

          if (filter) {
            for (let i = 0; i < filter.length; i++) {
              if (col.label === filter[i].name) {
                const obj = {terms: {}};
                obj.terms['data.' + col.name + '.keyword'] = [filter[i].value];
                params.query['bool'].filter.bool.must.push(obj);
              }
            }
          }
        }
      })
    }

    let obs: Observable<any>;

    if (this.application.useFTSearch === 'direct') {
      obs = this.apiService.executeFTSearchDirect(params, this.pageNum, this.pageSize,
        this.sortOptions && this.sortOptions.colName ? this.sortOptions : null);
    } else {
      if  (filter) {
        params['filter'] = params.query;
      }
      params['query'] = this.ftQuery;
      params['rootId'] = this.rootId;

      obs = this.apiService.executeFTSearch(params, this.pageNum, this.pageSize,
        this.sortOptions && this.sortOptions.colName ? this.sortOptions : null);
    }

    obs.subscribe((result) => {
        this.isLoading = false;

        this.dataTotalCount = result.docs.total;
        this.dataRows = result.docs.data.map((obj: Doc) => {
            const cmis = this.mapDocToCmisObj(obj);
            return this.mapCmisObjectToResultSet(cmis);
          }
        );
        if (result.aggregations) {
          this.ftAggregations = result.aggregations;
          this.tab1Active = true;
          this.tab2Active = false;
        } else {
          this.ftAggregations = null;
        }
      });
  }

  public createDoc(): void {
    this.sipService.create(this.selectedFolder ? this.selectedFolder.id : null, this.application).subscribe((id: string) => {
      if (id) {
        this.refresh();
      }
    });
  }

  public createFolder(): void {
    this.sipService.create(this.selectedFolder ? this.selectedFolder.id : null, this.application, null, 'folder')
      .subscribe((id: string) => {
      if (id) {
        this.refresh();
      }
    });
  }

  public editFolder(): void {
    this.sipService.open(this.selectedFolder.id, this.application, this.selectedFolder.type, null, true )
      .subscribe((result) => {
        if (result) {
          this.refresh()
        }
      });
  }

  private mapCmisObjectToResultSet(obj: CmisObject): SearchResultRow {
      const row: any = {id: obj.id};
      row.columns = [];

      this.rootFolderColumns.map((col: ResultMasterPanelTabColumn) => {
        if (obj[col.name]) {
          row.columns.push({name: col.name, value: obj[col.name]});
        } else if (obj.data && obj.data[col.name]) {
          row.columns.push({name: col.name, value: obj.data[col.name]});
        } else if (col.name === 'fileMimeType' || col.name === 'cmis:contentStreamFileName') {
          if (obj.type === 'folder' || obj.baseType === 'cmis:folder') {
            row.columns.push({name: col.name, value: 'folder'});
          }
        }
      });
      const result = new SearchResultRow(row);
      if (!result.columns.has('type')) {
        result.columns.set('type', new SearchResultRowColumn({name: 'type', value: obj.type, rows: null}));
      }
      return result;
  }

  private mapDocToCmisObj(doc: Doc): CmisObject {
    const cmis = new CmisObject();
    cmis.id = doc.id;
    cmis.type = doc.type;
    cmis.name = doc.title;
    cmis.baseType = doc.baseType;
    cmis.description = doc.description;
    cmis.lastModified = doc.lastModified;
    cmis.data = doc.data;
    cmis.data[CmisConstants.CMIS_PROP_FILE_NAME] = doc.fileName;
    cmis.data[CmisConstants.CMIS_PROP_NAME] = doc.title;
    cmis.data[CmisConstants.CMIS_PROP_BASETYPE] = doc.baseType;
    cmis.data[CmisConstants.CMIS_PROP_TYPE] = doc.type;
    cmis.data[CmisConstants.CMIS_PROP_ID] = doc.id;
    cmis.data[CmisConstants.CMIS_PROP_MODIFIED] = doc.lastModified;

    return cmis;
  }

  private loadFolderContents(): void {
    let sortOptions = (this.sortOptions && this.sortOptions.colName ? this.sortOptions : null);
    if (!sortOptions && this.defaultSortOptions && this.defaultSortOptions.colName) {
      sortOptions = this.defaultSortOptions;
    }
    this.apiService.getCmisData(this.selectedFolder.id, '', this.pageSize, this.pageNum, sortOptions)
      .subscribe((page: PagedList<CmisObject>) => {
      this.isLoading = false;
      this.folderData = page.data;
      this.dataTotalCount = page.total;
      this.dataTotalCountLoading = false;
      this.dataRows = page.data.map((obj: CmisObject) =>
        this.mapCmisObjectToResultSet(obj)
      );
    });
  }

  public refresh(): void {
    this.onItemsPageChange(this.pageNum)
  }

  public onItemOpen(link: {row: SearchResultRow, col: ResultMasterPanelTabColumn, preview?: boolean}) {
    if (this.application.platform !== Platforms.IA) {

      if (link.preview) {
        const fileName = link.row.get(link.col.name).value;
        this.previewService.launch(link.row.id, fileName);
        return;
      }

      if (this.folderData && this.folderData.length) {
        for (let i = 0; i < this.folderData.length; i++) {
          if (this.folderData[i].id === link.row.id) {
            if (this.folderData[i].baseType === CmisConstants.CMIS_TYPE_FOLDER) {

              let foldersPath = [this.folderData[i]];
              if (this.selectedFolderPath && this.selectedFolderPath.length > 0) {
                foldersPath = foldersPath.concat(this.selectedFolderPath);
              }

              this.onTreeFolderSelected(foldersPath);
            } else {
              this.sipService.open(this.folderData[i].id, this.application, this.folderData[i].type)
                .subscribe((result) => {
                  if (result) {
                    this.refresh()
                  }
                });
            }
            return;
          }
        }
      };

      this.sipService.open(link.row.id, this.application,
        link.row.columns.has('type') ? link.row.columns.get('type').value : null
      )
      .subscribe((result) => {
        if (result) {
          this.refresh()
        }
      });

    } else {
      this.apiService.downloadContent(this.application.uuid, link.row.get(link.col.name).value);
    }
  }

  public onItemColumnEdit(eventData: {row: SearchResultRow, col: ResultMasterPanelTabColumn, newValue: string}) {
    const id = eventData.row.id;
    const type = eventData.row.columns.get('type').value;
    const that = this;

    this.apiService.getDocument(id, type).subscribe((doc: Doc) => {
      if (doc.hasOwnProperty(eventData.col.name)) {
        doc[eventData.col.name] = eventData.newValue
      } else {
        doc.data[eventData.col.name] = eventData.newValue
      }
      that.apiService.saveDocumentData(doc, that.selectedFolder ? that.selectedFolder.id : null).subscribe((result) => {
        if (result) {
          that.refresh()
        }
      })
    });
  }

  public onSort(options: SortOptions) {
    if (this.dataTotalCount === 0) { return }

    this.sortOptions = options;
    this.onItemsPageChange(1);
  }

  public onItemsPageChange(pageNum: number): void {
    this.selectedRowsIds = [];
    this.pageNum = pageNum;
    this.pageSize = this.getPageSize();

    if (!!this.autoRefreshTask) { this.autoRefreshTask.unsubscribe(); }

    if (this.selectedFolder) {
      this.loadFolderContents();
      this.initAutoRefresh();
    } else if (this.selectedSearch) {
      this.loadSearchContents();
    } else if (this.ftQuery !== '') {
      this.loadFTSearchContents()
    }
  }

  public openSearch(): void {
    this.searchFormService.open(this.xForm, this.selectedSearch.name, this.currentSearchFormData)
      .subscribe((query) => {
      this.isLoading = true;
      this.dataRows = null;
      this.dataTotalCount = -1;
      this.pageNum = 1;
      this.currentSearchRequest = query.query;
      this.currentSearchFormData = query.formData;
      if (this.expanded) {
        this.toggleExpandedState();
      }
      this.loadSearchContents();
    });
  }

  public ftSearch(query: string) {
    if (query && query !== '') {
      this.selectedFolder = null;
      this.selectedFolderPath = null;
      this.selectedSearch = null;
      this.isLoading = true;
      this.dataRows = null;
      this.dataTotalCount = -1;
      this.pageNum = 1;
      this.sortOptions = undefined;
      this.pagingType = PagingTypes.PAGES;

      this.listSetupService.setColumns(this.rootFolderColumns);
      this.putBreadCrumb({name: this.ftQuery, id: null });
    }
  }

  public setupColumns() {
    this.listSetupService.changeSettings(this.pagingType === PagingTypes.CONTINUATION);
  }

  public export(selected = false) {
    const params = {application: this.application, type: null, data: null, dataName: null};
    if (selected) {
      if (this.selectedRowsIds && this.selectedRowsIds.length > 0) {
        params.type = ExportTypes.EXPORT_SELECTED;
        params.data = {compositionId: this.selectedSearch ? this.selectedSearchComposition.uuid : this.rootId, selectedIds: this.selectedRowsIds};
      } else {
        this.alertService.info({text: 'export.nothing', title: 'export.title'})
        return;
      }
    } else {
      if (this.selectedFolder) {
        params.type = ExportTypes.EXPORT_FOLDER;
        params.data = this.selectedFolder.id;
        params.dataName = this.selectedFolder.name;
      } else if (this.selectedSearch) {
        params.type = ExportTypes.EXPORT_SEARCH;
        params.data = {compositionId: this.selectedSearchComposition.uuid, query: this.currentSearchRequest, sortOptions: this.sortOptions};
        params.dataName = this.selectedSearch.name;
      } else if (this.ftQuery !== '') {
        params.type = ExportTypes.EXPORT_FTSEARCH;
        params.data = this.ftQuery;
        params.dataName = this.ftQuery;
      } else {
        this.alertService.info({text: 'export.nothing', title: 'export.title'})
        return
      }
    }
    this.exportService.openDialog(params)
  }

  public onRowsSelected(selectedIds) {
    this.selectedRowsIds = selectedIds;
  }

  public onAggregationSelected(agr: {name: string, value: string}[]) {
    this.loadFTSearchContents(agr);
  }

  public openLastFolder() {
    if (this.lastSelectedFolderPath) {
      this.onTreeFolderSelected(this.lastSelectedFolderPath);
    } else if (!this.rootId) {
      console.log('loading root folder...');
      const that = this;
      this.apiService.getApplicationTreeRoot(this.application.uuid).subscribe(rootId => {
        this.apiService.getDocument(rootId).subscribe((rootDoc: Doc) => {
          that.onRootFolderLoaded(rootDoc);
          const root = that.mapDocToCmisObj(rootDoc);
          root.hasChildren = true;
          that.onTreeFolderSelected([root]);
        });
      });
    } else if (this.rootFolder) {
      const root = this.mapDocToCmisObj(this.rootFolder);
      root.hasChildren = true;
      this.onTreeFolderSelected([root]);
    } else {
      throw 'Root data is unavailable!'
    }
  }
  public openLastSearch() {
    if (this.lastSelectedSearch) {
      this.selectSearch(this.lastSelectedSearch);
    }
  }

  public onFilesDrop(event) {
    if (this.dndEventActive) {
      this.dndEventActive = false;
      return;
    }
    this.dndEventActive = true;
    console.log('onFilesDrop');

    if (!this.selectedFolder) {
      this.alertService.info({text: 'import.dndFoldersOnly', title: 'export.title'})
    } else {
      const folderId = this.selectedFolder ? this.selectedFolder.id : this.rootFolder.id;
      const docTypeId = 'cmis:document';
      if (this.application.createTypes && this.application.createTypes.length > 0) {
        docTypeId = this.application.createTypes[0];
      }
      this.dndImportService.uploadFiles(event.dataTransfer, folderId, docTypeId).subscribe(() => {
        console.log('refreshing');
        this.directiveRef.reset();
        setTimeout(() => this.refresh(), 1000);
      });
    }
  }

  private calcHeight() {
    this.menuMaxHeight = window.innerHeight - 160;
    if (this.menuMaxHeight < 200) {
      this.menuMaxHeight = 200;
    }
  }

  private putBreadCrumb(crumb: {name: string, id: string, func?: any}, append = false ) {
    if (append) {
      this.breadCrumbs.push(crumb);
    } else {
      this.breadCrumbs = [crumb];
    }
  }

  private initAutoRefresh() {
    if (this.pageNum === 1 && this.setupDisp.autoRefresh > 0) {
      this.autoRefreshTask = Observable.interval(this.setupDisp.autoRefresh * 1000)
        .subscribe(
          () => {
            this.loadFolderContents();
          },
          error => {console.log(error)});
    }
  }

  private calcDisplayType(): string {
    if (window.innerWidth < environment.minScreenSize) {
      return DisplayTypes.TILES;
    } else {
      return DisplayTypes.TABLE;
    }
  }

  @HostListener('window:resize', ['$event'])
   onResize(event) {
     this.calcHeight();
   }

}
