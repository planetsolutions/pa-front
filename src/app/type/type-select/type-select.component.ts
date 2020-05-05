import {Component, Input, AfterViewInit, ViewChild} from '@angular/core';
import {DocType, Application} from '../../index';
import {ITreeOptions, ITreeState, TreeComponent, TreeModel, TreeNode} from 'angular-tree-component';
import {BsModalService} from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {ApiService} from '../../services/api/api.service';

@Component({
  selector: 'app-type-select',
  templateUrl: './type-select.component.html',
  styleUrls: ['./type-select.component.css'],
  providers: [BsModalService]
})
export class TypeSelectComponent  {
  @Input() set applicationId(id: string){
    if (id) {
      this.apiService.getApplicationInfo(id).subscribe((application: Application) => {
        this.application = application;
        this.loadTypes();
      });
    } else {
      this.loadTypes();
    }
  }

  @Input()
  public rootTypeName: string;

  @Input()
  public disableAbstract = false;

  treeNodes = [];

  @ViewChild(TreeComponent)
  private tree: TreeComponent;
  private _selectedType: DocType;
  private application: Application;

  options: ITreeOptions = {
    getChildren: this.getChildren.bind(this),
    actionMapping: {
      mouse: {
        dblClick: this.treeNodeDblClick.bind(this),
        click: this.treeNodeClick.bind(this)
      }
    }
  };

  private treeNodeClick(tree, node: TreeNode, $event): void {
    if(this.disableAbstract && node.data.typeObject.symbolicName.startsWith('abstract_')) return;
    node.setIsActive(true);
  }
  private treeNodeDblClick(tree, node: TreeNode, $event): void {
    if(this.disableAbstract && node.data.typeObject.symbolicName.startsWith('abstract_')) return;
    this.ok();
  }

  constructor(public bsModalRef: BsModalRef, private apiService: ApiService) { }

  private loadTypes() {

    const that = this;
    this.apiService.getTypes().subscribe((data: DocType[]) => {
      if (this.rootTypeName && this.rootTypeName !== '') {
        data.map((obj) => {
          if (obj.symbolicName === this.rootTypeName) {
            if(this.application) {
              this.getChildren(obj).then((list: any[]) => {
                list.map((val) => {
                  if (that.application && that.application.createTypes.length > 0) {
                    if (that.application.createTypes.indexOf(val.typeObject.symbolicName) > -1) {
                      that.treeNodes.push(val);
                    }
                  } else {
                    that.treeNodes.push(val);
                  }
                });
                that.tree.treeModel.update();
              });
            } else {
              that.treeNodes.push(that.mapTypeObjecToNode(obj));
              that.tree.treeModel.update();
            }
          }
        });
      } else {
        data.map((obj) => {
          that.treeNodes.push(that.mapTypeObjecToNode(obj));
        });
        that.tree.treeModel.update();
      }

    });
  }

  get selectedType(): DocType {
    return this._selectedType;
  }

  ok() {
    const node = this.tree.treeModel.getActiveNode();
    this._selectedType = node.data.typeObject;
    this.bsModalRef.hide();
  }

  private mapTypeObjecToNode(obj: DocType) {
    return {
      id: obj.id,
      name: obj.title,
      hasChildren: true,
      typeObject: obj
    };
  }

  private getChildren(node: any) {
    const that = this;
    return new Promise((resolve, reject) => {
      this.apiService.getTypes(node.id).subscribe((data: DocType[]) => {
        const childs = data.map((obj: DocType) =>
          that.mapTypeObjecToNode(obj)
        );
        resolve(childs);
      });
    });
  }

}
