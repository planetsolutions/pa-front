import {Component, EventEmitter} from '@angular/core';
import {Doc} from '../../../index';
import {Observable} from 'rxjs/Observable';
import {SipFormI} from '../sip-form-i';
import {Application} from '../../../services/api/model/application';
import {ApiService} from '../../../services/api/api.service';
import {TranslateService} from '@ngx-translate/core';
import {NgForm} from '@angular/forms';
import {AlertsService} from "../../../alerts/alerts.service";

@Component({
  selector: 'app-sip-form-data',
  templateUrl: './sip-form-data.component.html'
})

export class SipFormDataComponent implements SipFormI {
  public static code = '_data';
  public application: Application;
  public parentFolderId: string;
  public docTypeId: string;
  public docId: string;
  public isSystem: boolean;

  doc: Doc = new Doc({});
  mode: boolean;
  onTitleChange: EventEmitter<string>  = new EventEmitter<any>();
  onValidChange: EventEmitter<boolean> = new EventEmitter<any>();
  public onAclSet: EventEmitter<any> = new EventEmitter();
  private formIsValid = true;

  parseError: null;

  private changedData: any;

  aceEditorOptions: any = {
    highlightActiveLine: true,
    maxLines: 23,
    printMargin: false,
    autoScrollEditorIntoView: true
  };

  constructor(private apiService: ApiService, private alertService: AlertsService) {

  }

  public onAfterCreated(): any {
      if (this.docId && this.docId !== '') {
        let obs: Observable<Doc>;
        if (this.isSystem) {
          obs = this.apiService.getSystemDoc(this.docId, true);
        } else {
          obs = this.apiService.getDocument(this.docId, this.docTypeId);
        }
        obs.subscribe((doc: Doc) => {
          this.doc = doc;
          this.onAclSet.emit({
            edit: true,
            remove: true,
            full: true
          });
        });
      } else {
          this.doc = new Doc({type: this.docTypeId || ''});
      }
  }

  onJsonChange(json) {
    if(json && json !== '') {
      try {
        this.changedData = JSON.parse(json);
        this.isValid(true);
        this.parseError = null;
      } catch(err) {
        console.log('parse error: ' + err);
        this.parseError = err;
        this.isValid(false);
      }
    }
  }


  changeMode(editMode: boolean): void {
  }

  submit(): Observable<string> {
    this.doc.data = this.changedData;

    return this.saveDoc(this.doc);

  }

  private saveDoc(doc: Doc): Observable<string> {
    return this.apiService.saveDocumentData(doc)
      .catch((err) => {
        this.alertService.error({error: err});
        return Observable.throw('Save error')
      })
      .flatMap((result: Doc) =>  {
        doc =  result;
        if (!this.docId && this.parentFolderId && this.parentFolderId !== '') { // новый док кладем в папку, если она задана
          return this.apiService.moveDocumentToFolder(result.id, this.parentFolderId)
        } else {
          return Observable.of(result);
        }
      }).map((result2: Doc) => result2.id)
      ;
  }

  formChanged(ngForm: NgForm) {
    this.isValid(ngForm.form.valid);
  }

  isValid(isValid: boolean): void {
    this.formIsValid = isValid;
    this.onValidChange.emit(isValid);
  }


  prepareDocument(): Doc {
      const doc = new Doc({});
      const date = new Date();

      doc.id = this.docId || null;


      return doc;
  }

  remove(): Observable<string> {
    return null;
  }

}
