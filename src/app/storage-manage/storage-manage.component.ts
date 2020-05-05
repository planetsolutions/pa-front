import {Component, OnInit, ViewChild} from '@angular/core';
import {DocType, ResultMasterColumnTypes, SearchResultRow, ResultMasterPanelTabColumn,
  SystemDoc} from '../index';
import {ApiService} from '../services/api/api.service';
import {TranslateService} from '@ngx-translate/core';
import {SystemService} from '../sip/system.service';
import {ITreeOptions, TreeComponent, TreeNode} from 'angular-tree-component';
import {AlertsService} from '../alerts/alerts.service';

@Component({
  selector: 'app-storage-manage',
  templateUrl: './storage-manage.component.html'
})
export class StorageManageComponent implements OnInit {
  selectedType: DocType;
  policiesParentId = 'storage_policy';
  retentionParentId = 'retention_policy';
  storageTypes: DocType[];
  isLoading = false;
  dataColumns = [];
  treeNodes = [];
  docs: SystemDoc[];
  dataRows: SearchResultRow[];
  showProcessAction = false;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  options: ITreeOptions = {
    actionMapping: {
      mouse: {
        click: this.treeNodeClick.bind(this)
      }
    }
  };

  constructor(private apiService: ApiService, private systemService: SystemService,
              private translate: TranslateService, private alertService: AlertsService) {}

  ngOnInit() {

    this.translate.get('applications.root').subscribe((rootName: string) => {
      this.dataColumns = [
        {
          name: 'id',
          label: this.translate.instant('search.data.id'),
          hidden: false,
          type: ResultMasterColumnTypes.STRING,
          sortable: true,
          link: true
        },
        {
          name: 'name',
          label: this.translate.instant('search.data.title'),
          hidden: false,
          type: ResultMasterColumnTypes.STRING,
          sortable: true,
          link: true
        }
      ];

      this.treeNodes.push({
          id: this.policiesParentId,
          name: this.translate.instant('storage.policies'),
          hasChildren: false
        },
        {
          id: this.retentionParentId,
          name: this.translate.instant('storage.retention'),
          hasChildren: false
        }
      );

      this.apiService.getType('abstract_storage')
        .flatMap((obj: DocType) => this.apiService.getTypes(obj.id))
        .subscribe((data: DocType[]) => {

          this.treeNodes.push({
            id: 'storageTypes',
            name: this.translate.instant('storage.types'),
            hasChildren: true,
            isExpanded: true,
            children: data.map((type: DocType) => {
              return {
                id: type.symbolicName,
                name: type.title,
                hasChildren: false
              }
            })
          });
          this.tree.treeModel.update();
          this.tree.treeModel.expandAll();
          // this.storageTypes = data;
          this.treeNodeClick();
        });


    });
  }

  treeNodeClick(tree?, node?: TreeNode) {
    if (node && node.hasChildren) {
      return;
    }

    const id = (node ? node.id : this.policiesParentId);
    this.apiService.getType(id).subscribe((type: DocType) => {
      this.selectedType = type;
      this.loadItems();
    });


    if (node) {
      node.setIsActive(true);
    } else {
      this.tree.treeModel.getNodeById(id).setIsActive(true)
    }
  }

  private loadItems() {
    this.isLoading = true;
    this.apiService.getSystemDocs(this.selectedType.symbolicName)
      .subscribe((data: SystemDoc[]) => {
        this.showProcessAction = (data.length > 0 && this.selectedType.symbolicName === 'retention_policy');
        this.isLoading = false;
        this.docs = data;
        this.dataRows = data.map((obj: SystemDoc) => {
          return new SearchResultRow({
            id: obj.id,
            columns: [{name: 'id', value: obj.id}, {name: 'name', value: obj.title}]
          });
        });
      });
  }

  add() {
    this.systemService.create(this.selectedType.symbolicName)
      .subscribe((id: string) => {
        if (id) {
          this.loadItems();
        }
      });
  }

  onItemOpen(link: {row: SearchResultRow, col: ResultMasterPanelTabColumn}) {
      this.systemService.open(link.row.id, this.selectedType.symbolicName).subscribe(() => {
        this.loadItems();
      });
  }

  processRetention() {
      this.apiService.processRetention().subscribe((info: any) => {
        const infoDisp = [];
        this.docs.filter((doc: SystemDoc) => {
          infoDisp.push(doc.title + ': ' + info[doc.symbolicName])
        });

        this.alertService.info({text: infoDisp.join('<br>'), title: 'storage.processRetention.result'})
      }, (err) => {
        this.alertService.error({error: err});
      });
  }

}
