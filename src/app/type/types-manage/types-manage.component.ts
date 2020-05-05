import {Component, OnInit, ViewChild} from '@angular/core';
import {DocType} from '../../index';
import {TypesTreeComponent} from './types-tree/types-tree.component';
import {ApiService} from '../../services/api/api.service';
import {SystemService} from '../../sip/system.service';

@Component({
  selector: 'app-types-manage',
  templateUrl: './types-manage.component.html',
  styleUrls: ['./types-manage.component.css']
})
export class TypesManageComponent implements OnInit {
  public selectedType: DocType;

  @ViewChild (TypesTreeComponent)
  private tree: TypesTreeComponent;

  constructor(private systemService: SystemService, private apiService: ApiService) { }

  ngOnInit() {
  }

  onTypeSelected(type: DocType) {
    this.selectedType = type;
  }

  createType() {
    const type = new DocType({});
    if (this.selectedType) {
      type.parent = this.selectedType.id;
    }

    this.selectedType = type;
  }

  onTypeSaved(saveType: DocType) {
     this.tree.refreshTree(saveType);
     this.selectedType = null;
  }

  editJson() {
    this.systemService.open(this.selectedType.id, 'type', true)
      .subscribe((id) => {
        if (id) {
            this.apiService.getType(id, true).subscribe((type: DocType) => {
              this.selectedType = type;
            });
        }
      });
  }
}
