import {Component, Input, AfterViewInit, ViewChild, EventEmitter, Output} from '@angular/core';
import {DocType} from '../../../index';
import {ITreeOptions, ITreeState, TreeComponent, TreeModel, TreeNode} from 'angular-tree-component';
import {ApiService} from '../../../services/api/api.service';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-types-tree',
  templateUrl: './types-tree.component.html',
  styleUrls: ['./types-tree.component.css']
})
export class TypesTreeComponent implements AfterViewInit {

  @Input() set applicationId(id: string){
    this._applId = id;
    this.loadTypes();
  }
  @Output() selectionChange: EventEmitter<DocType> = new EventEmitter<DocType>();

  treeNodes = [];

  @ViewChild(TreeComponent)
  private tree: TreeComponent;
  private _applId;

  options: ITreeOptions = {
    getChildren: this.getChildren.bind(this),
    actionMapping: {
      mouse: {
        click: this.treeNodeClick.bind(this)
      }
    }
  };

  constructor(private apiService: ApiService) { }

  private treeNodeClick(tree, node: TreeNode, $event): void {
    node.setIsActive(true);
    this.selectionChange.emit(node.data.typeObject);
  }

  ngAfterViewInit(): void {
    this.loadTypes();
  }

  private loadTypes() {
    if(this.tree.treeModel && this.tree.treeModel.getActiveNode()) {
      this.tree.treeModel.getActiveNode().setIsActive(false);
    }

    this.treeNodes = [];

    const that = this;
    this.apiService.getTypes().subscribe((data: DocType[]) => {
      data.map((obj) => {
        that.treeNodes.push(that.mapTypeObjectToNode(obj));
      });
      that.tree.treeModel.update();
      // that.tree.treeModel.collapseAll();

    });
  }

  private mapTypeObjectToNode(obj: DocType) {
    return {
      id: obj.id,
      name: obj.title,
      hasChildren: true,
      typeObject: obj
    };
  }

  private getChildren(node: any) {
    const that = this;
    if (node.isDescendantOf(this.tree.treeModel.virtualRoot)) { // https://github.com/500tech/angular-tree-component/issues/517
      return new Promise((resolve, reject) => {
        this.apiService.getTypes(node.id).subscribe((data: DocType[]) => {
          const childs = data.map((obj: DocType) =>
            that.mapTypeObjectToNode(obj)
          );
          resolve(childs);
        });
      });
    }
  }

  refreshTree(updatedType?: DocType) {
      this.loadTypes();
  }
}
