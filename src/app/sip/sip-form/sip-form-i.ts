import {Observable} from 'rxjs/Observable';
import {Application} from '../../services/api/model/application';
import {EventEmitter} from '@angular/core';

export interface SipFormI {
  application: Application;
  parentFolderId?: string;
  docTypeId?: string;
  docId: string;
  mode: boolean;
  isSystem?: boolean;
  onTitleChange: EventEmitter<string>;
  onValidChange: EventEmitter<boolean>;
  onAclSet: EventEmitter<{edit: boolean, remove: boolean, full: boolean}>;

  onAfterCreated(): void;
  submit(): Observable<string>;
  remove(): Observable<string>;
  changeMode (editMode: boolean): void;
}
