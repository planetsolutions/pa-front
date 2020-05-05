import {AfterViewInit, Component, Input, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
import {CmisObject, Application, CmisConstants, PagedList} from '../../../index';
import {ITreeOptions, TreeComponent, TreeNode} from 'angular-tree-component';
import {ApiService} from '../../../services/api/api.service';
import {Observable} from 'rxjs/Observable';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-folders-tree',
  templateUrl: './folders-tree.component.html'
})
export class FoldersTreeComponent implements OnInit {
  treeNodes = [];

  @Output() selectionChange: EventEmitter<CmisObject[]> = new EventEmitter();

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  options: ITreeOptions = {
    getChildren: this.getChildren.bind(this),
    actionMapping: {
      mouse: {
        click: this.treeNodeClick.bind(this)
      }
    }
  };

  constructor(private apiService: ApiService, private translate: TranslateService) { }

  ngOnInit() {
    this.loadTop();
  }

  private loadTop() {
    const that = this;
    this.apiService.getCmisData('0', CmisConstants.CMIS_FILTER_FOLDERS, 1000).subscribe((page: PagedList<CmisObject>) => {
      page.data.map((obj) => {
        this.treeNodes.push(that.mapCmisObjecToNode(obj));
      });
      that.tree.treeModel.update();
    });
  }

  private mapCmisObjecToNode(obj: CmisObject) {

    return {
      id: obj.id,
      name: obj.name,
      hasChildren: obj.hasChildren,
      object: obj,
      isExpanded: false
    };
  }

  private getChildren(node: any) {
    const that = this;

    return new Promise((resolve, reject) => {
      this.apiService.getCmisData(node.id, CmisConstants.CMIS_FILTER_FOLDERS, 100).subscribe((page: PagedList<CmisObject>) => {
        const childs = page.data.map((obj: CmisObject) =>
          that.mapCmisObjecToNode(obj)
        );
        resolve(childs);
      });
    });
  }

  private treeNodeClick(tree, node: TreeNode, $event): void {
    const folders: CmisObject[] = [];
    folders.push(<CmisObject>node.data.object);
    node.setIsActive(true);

    let parent = node.parent;
    while ( parent && parent.data.object) {
      folders.push(<CmisObject>parent.data.object);
      parent = parent.parent;
    }
    this.selectionChange.emit(folders);
  }
}
