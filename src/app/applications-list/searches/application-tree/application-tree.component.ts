import {AfterViewInit, Component, Input, OnInit, EventEmitter, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {CmisObject, Application} from '../../../index';
import {ITreeOptions, TreeComponent, TreeNode} from 'angular-tree-component';
import {ApiService} from '../../../services/api/api.service';
import {CmisConstants} from '../../../services/api/model/cmis-constants';
import {Observable} from 'rxjs/Observable';
import CMIS_FILTER_FOLDERS = CmisConstants.CMIS_FILTER_FOLDERS;
import {PagedList} from '../../../index';
import {TranslateService} from '@ngx-translate/core';
import {Doc} from "../../../services/api/model/doc";

@Component({
  selector: 'app-application-tree',
  templateUrl: './application-tree.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./application-tree.component.css']
})
export class ApplicationTreeComponent implements AfterViewInit {
  _application: Application;

  @Input() set application(value: Application) {
    this._application = value;
    this.loadRoot();
  }

  get application(): Application {
    return this._application;
  }

  @Output() selectionChange: EventEmitter<CmisObject[]> = new EventEmitter<CmisObject[]>();
  @Output() rootLoaded: EventEmitter<Doc> = new EventEmitter<Doc>();

  treeNodes = [];

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

  ngAfterViewInit() {

  }

  private loadRoot(): void {
    if (!this.application) { return; };

    console.log('loading root nodes...');
    const that = this;
    this.apiService.getApplicationTreeRoot(this.application.uuid).subscribe(rootId => {

      this.apiService.getDocument(rootId).subscribe((rootDoc: Doc) => {
        this.rootLoaded.emit(rootDoc);

        const root = new CmisObject();
        root.id = rootId;
        root.baseType = CmisConstants.CMIS_TYPE_FOLDER;
        root.type = CmisConstants.CMIS_TYPE_FOLDER;
        root.name = rootDoc.title;
        root.hasChildren = true;
        const rootNode = this.mapCmisObjecToNode(root);

        that.treeNodes.push(rootNode);
        that.tree.treeModel.update();

       this.tree.treeModel.getNodeById(rootId).expand();


      });
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
