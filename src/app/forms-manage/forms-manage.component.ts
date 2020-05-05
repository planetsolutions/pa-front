import {Component, OnInit, ViewChild} from '@angular/core';
import {DocType, ResultMasterColumnTypes, SearchResultRow, ResultMasterPanelTabColumn,
  SystemDoc} from '../index';
import {ApiService} from '../services/api/api.service';
import {SipService} from '../sip/sip.service';
import {TranslateService} from '@ngx-translate/core';
import {SystemService} from '../sip/system.service';
import {ITreeOptions, TreeComponent, TreeNode} from 'angular-tree-component';

@Component({
  selector: 'app-forms-manage',
  templateUrl: './forms-manage.component.html'
})
export class FormsManageComponent implements OnInit {
  selectedType: DocType;
  isLoading = false;
  dataColumns = [];
  treeNodes = [];
  dataRows: SearchResultRow[];

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  options: ITreeOptions = {
    actionMapping: {
      mouse: {
        click: this.treeNodeClick.bind(this)
      }
    }
  };

  constructor(private apiService: ApiService, private systemService: SystemService, private translate: TranslateService) {}

  ngOnInit() {

    this.translate.get('type.tabs').subscribe((rootName: string) => {
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
          id: 'tabs_config',
          name: rootName,
          hasChildren: false
        }
      );

      this.tree.treeModel.update();
      // this.tree.treeModel.expandAll();

      this.treeNodeClick()

    });
  }

  treeNodeClick(tree?, node?: TreeNode) {
    if (!this.tree.treeModel.getFirstRoot()) {
      setTimeout(() => this.treeNodeClick(tree, node), 200);
      return;
    }
    const id = (node ? node.id : this.tree.treeModel.getFirstRoot().id);
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
        this.isLoading = false;
        if (data && data.length > 0) {
          this.dataRows = data.map((obj: SystemDoc) => {
            return new SearchResultRow({
              id: obj.id,
              columns: [{name: 'id', value: obj.id}, {name: 'name', value: obj.title}]
            });
          })
        } else {
          this.dataRows = []
        }
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

}
