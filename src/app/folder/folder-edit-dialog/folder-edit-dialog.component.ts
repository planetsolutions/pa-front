import {Component, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {CmisObject, Doc} from '../../index';
import {ApiService} from '../../services/api/api.service';
import {SipService} from "../../sip/sip.service";
import {SipFormDataComponent} from "../../sip/sip-form/data-impl/sip-form-data.component";

@Component({
  selector: 'app-folder-edit-dialog',
  templateUrl: './folder-edit-dialog.component.html'
})
export class FolderEditDialogComponent implements OnInit {
  @Input()  public parentFolder: string;
  @Input()  public folderId: string;
  @Input()  public typeId: string;

  folder: {name: string, type: string}  = {name: '', type: ''};

  public onSubmit: EventEmitter<string> = new EventEmitter<string>();

  constructor(private apiService: ApiService, public bsModalRef: BsModalRef, private sipService: SipService) { }

  ngOnInit() {

  }

  public afterParamsSet(): void {
    if (this.folderId && this.folderId !== '') {
      this.apiService.getDocument(this.folderId).subscribe((doc: Doc) => {
        this.folder.name = doc.title;
        this.folder.type = doc.type;
      });
    } else {
      this.folder.type = this.typeId || 'folder';
    }
  }

  public submit(): void {
    const obj = new CmisObject({});
    obj.name = this.folder.name;
    obj.type = this.folder.type;
    obj.id = this.folderId;
    this.apiService.saveFolder(obj, this.parentFolder)
      .subscribe((res: CmisObject) => {
        this.onSubmit.emit(res.id);
        this.bsModalRef.hide();
      });

  }

  public editJson(): void {
    this.bsModalRef.hide();
    this.sipService.open(this.folderId, null, null, SipFormDataComponent.code, true);
  }
}
