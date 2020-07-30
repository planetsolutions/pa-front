import {Component, EventEmitter} from '@angular/core';
import {FormElement, DocType, Doc, SystemDoc, CmisObject, PagedList} from '../../../index';
import {Observable} from 'rxjs/Observable';
import {SipFormI} from '../sip-form-i';
import {Application} from '../../../services/api/model/application';
import {ApiService} from '../../../services/api/api.service';
import {TranslateService} from '@ngx-translate/core';
import {DateTimeFormatPipe} from '../../../pipes/date-time-format.pipe';
import {environment} from '../../../../environments/environment';
import {DatePickerWidgetComponent} from '../../../form-widgets/date-picker-widget.component';
import {TypeSelectWidgetComponent} from '../../../form-widgets/type-select-widget.component';
import {CmisConstants} from '../../../services/api/model/cmis-constants';
import {TypeaheadWidgetComponent} from '../../../form-widgets/typeahead-widget.component';
import {AlertsService} from "../../../alerts/alerts.service";
import {PreviewService} from "../../preview/preview.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-sip-form-pg',
  templateUrl: './sip-form-pg.component.html'
})

export class SipFormPgComponent implements SipFormI {
  public application: Application;
  public parentFolderId: string;
  public docTypeId: string;
  public baseType: string;
  public docId: string;
  public formSchema: any;
  public widgets: any;
  public docData: any;
  public docType: DocType;
  public doc: Doc;
  public attachments = [];
  public mode: boolean;
  public isSystem: boolean;
  public onTitleChange: EventEmitter<string> = new EventEmitter<any>();
  public onValidChange: EventEmitter<boolean> = new EventEmitter<any>();
  public onAclSet: EventEmitter<{edit: boolean, remove: boolean, full: boolean}> = new EventEmitter();
  public maxHeight = 0;
  public canEditFile = false;

  public formIsValid: boolean = null;
  public jsonFormOptions: any = {
    addSubmit: false,
    loadExternalAssets: false, // Load external css and JavaScript for frameworks
    formDefaults: { feedback: false }, // Show inline feedback icons
    debug: false,
    // returnEmptyFields: true,
    customOptions: {}
  };

  private liveFormData: any = {};
  public formError: any = null;
  public renditions: Array<{id: string, fileName: string, fileSize: number}>;
  public tabsByName: Array<Doc> = [];
  public activeTabName: string;

  constructor(private apiService: ApiService, private translate: TranslateService, private preview: PreviewService,
              private sanitizer: DomSanitizer, private dateTimePipe: DateTimeFormatPipe, private alertService: AlertsService) {
    this.widgets = {
      'type-select': TypeSelectWidgetComponent,
      'date-picker': DatePickerWidgetComponent,
      'typeahead': TypeaheadWidgetComponent
    }
  }

  public onAfterCreated(): any {
     this.maxHeight = window.innerHeight - 300;
     if (this.maxHeight < 200) {
       this.maxHeight = 200;
     }

      if (this.docId && this.docId !== '') {
        let obs: Observable<Doc>;
        if (this.isSystem) {
          obs = this.apiService.getSystemDoc(this.docId, true);
        } else {
          obs = this.apiService.getDocument(this.docId, this.docTypeId);
          this.loadRenditions();

        }

        obs.subscribe((doc: Doc) => {
            this.doc = doc;
            this.docData = doc.data || {};
            this.onTitleChange.emit(doc.title);

            this.onAclSet.emit({
              edit: this.isSystem || (doc.acl.indexOf('edit_prop') > -1 || doc.acl.indexOf('full') > -1),
              remove: this.isSystem || (doc.acl.indexOf('delete') > -1 || doc.acl.indexOf('full') > -1),
              full: this.isSystem || doc.acl.indexOf('full') > -1
            });

            this.renderForm(doc.type);
        }, err => this.formError = err);
      } else {

       this.jsonFormOptions.returnEmptyFields = false;

        this.renderForm(this.docTypeId);

        if (!this.parentFolderId || this.parentFolderId === '') {
          if (this.application) {
            this.apiService.getApplicationTreeRoot(this.application.uuid).subscribe(rootId => {
              this.parentFolderId = rootId;
            });
          } else {
            this.parentFolderId = environment.rootId;
          }
        }
      }

  }

  private renderForm(typeId: string): void {

    if (this.mode && (!this.doc || this.doc.acl.indexOf('full') > -1 || this.doc.acl.indexOf('change_content') > -1)) {
      this.canEditFile = true;
    }

    this.apiService.getType(typeId).subscribe((type: DocType) => {

        this.docType = type;
        this.jsonFormOptions.customOptions['type'] = type.symbolicName;
        if (!this.mode) {
          this.changeMode(false);
        } else {
          this.formSchema = this.buildSchema();
          this.onValidChange.emit(false);
        }

        if (type.optionalTabs && type.optionalTabs.length > 0) {
          this.apiService.getSystemDocs('tabs_config').subscribe((sysDocs: SystemDoc[]) => {
            sysDocs.map((sysDoc: SystemDoc) => this.tabsByName[sysDoc.symbolicName] = sysDoc)
          })
        }


      }, err => this.formError = err);
  }

  private buildSchema(): any {
    if (!this.docType.schema) {
      this.docType['schema'] = {properties: {}};
    }

    let schemaProps = JSON.parse(JSON.stringify(this.docType.schema.properties)); // работаем с копией, чтобы иметь оригинальные данные
    const layout = [];

    if (!schemaProps.title) {
      // insert Title field into the first position
      schemaProps['title'] = {title: this.translate.instant('document.title'), type: 'string', index: -1};
    }

    if (this.doc && !this.docData.title) {
      this.docData['title'] = this.doc.title;
    }

    if (!schemaProps.description) {
      // insert descr to the end
      schemaProps['description'] = {title: this.translate.instant('document.descr'), type: 'string', index: 100, level: 100};
    }

    if (this.doc && !this.docData.description) {
      this.docData['description'] = this.doc.description;
    }

    schemaProps = this.sortProperties(schemaProps);

    for (const propName in  schemaProps) {
      if (this.mode || (this.docData[propName] && this.docData[propName] + '' !== '')) {
        this.addPropToLayout(layout, propName, schemaProps[propName]);
        schemaProps[propName].readonly = !this.mode;
      }
    }

    let required = [];
    if (this.mode) {
      required = this.docType.schema.required || [];
      if (required.indexOf('title') === -1) {
        required.push('title');
      }
    }


    const out = {
      schema: {
        properties: schemaProps,
        required: required
      },
      layout: layout
    };

    return out;
  }

  private sortProperties(schemaProps): any {

    let sortedProps = [];
    for (const propName in  schemaProps) {
      const prop = schemaProps[propName];
      prop['name'] = propName;
      sortedProps.push(prop);
    }

    sortedProps = sortedProps.sort((n1, n2) => {
      if (isNaN(n1.index)) {
        n1.index = 50;
      }
      if (isNaN(n2.index)) {
        n2.index = 50;
      }
      if (isNaN(n1.level)) {
        n1.level = 0;
      }
      if (isNaN(n2.level)) {
        n2.level = 0;
      }

      const v1 = n1.level * 100 + n1.index;
      const v2 = n2.level * 100 + n2.index;

      if (v1 > v2) {
        return 1;
      }

      if (v1 < v2) {
        return -1;
      }

      return 0;
    });

    const out = {};
    sortedProps.map(p => {
      out[p.name] = p;
    });

    return out;
  }

  changeMode(editMode: boolean): void {

    if (this.docType && this.docType.schema) {

      this.formSchema = null;
      const that = this;
      setTimeout(() => {
        that.formSchema = this.buildSchema();  // почему-то не срабатывает, если менять сразу
      }, 100);

    } else {
      console.log('doc type not found!!');
    }
    if (this.mode !== editMode) {
      this.mode = editMode;
      // this.detector.detectChanges();

      if (this.mode && (!this.doc || this.doc.acl.indexOf('full') > -1 || this.doc.acl.indexOf('change_content') > -1)) {
        this.canEditFile = true;
      }
    }

  }

  submit(): Observable<string> {

    const doc: Doc = this.prepareDocument();
    return this.saveDoc(doc);

  }

  private saveDoc(doc: Doc): Observable<string> {
    let obs: Observable<Doc>;
    if (this.isSystem) {
      obs = this.apiService.saveSystemDoc(doc);
    } else {
      // obs = this.apiService.saveDocument(doc, this.parentFolderId, (this.attachments ? this.attachments[0] : null));
      obs = this.apiService.saveDocumentData(doc, !this.docId ? this.parentFolderId : undefined)
        .flatMap((result: Doc) => {
          doc =  result;
          if (this.attachments && this.attachments.length > 0) {
            return this.apiService.addAttachment(result.id, this.attachments[0], this.docTypeId);  // если аттач менялся, то постим
          } else {
            return Observable.of(result);
          }
        })
        /*.first()
        .flatMap((result2: Doc) =>  {
          if (!this.docId && this.parentFolderId && this.parentFolderId !== '') { // новый док кладем в папку, если она задана
            return this.apiService.moveDocumentToFolder(doc.id, this.parentFolderId);
          } else {
            return Observable.of(result2);
          }
        })*/
    }
     return obs
       .catch((err) => {
         this.alertService.error({error: err});
         return Observable.throw('Save error')
       })
      .map((res: Doc) => res.id);

  }

  isValid(isValid: boolean): void {
    // console.log(isValid);
    this.formIsValid = isValid;
    this.onValidChange.emit(isValid);
  }

  onValidationErrors(data) {
    if (data) {
      // console.log(data);
    }
  }

  onFileIconClick(fileName: string, id: string) {
    if (fileName && fileName !== '' && id && id !== '') {
      if (this.preview.isPreviewSupported(fileName)) {
          this.preview.launch(id, this.application);
      }
    }
  }

  getFileIconStyle(fileName: string) {
    if (fileName && fileName !== '') {
      if (this.preview.isPreviewSupported(fileName)) {
        return this.sanitizer.bypassSecurityTrustStyle('cursor: pointer');
      }
    }
    return '';
  }

  onFormChanges(data: any) {
    this.liveFormData = data;
  }

  onAttachmentsChange(attachments: any) {
    this.attachments = attachments;
  }

  private addPropToLayout(layout: any[], name: string, property: any): void {
    let type = 'text';
    const origProp = this.docType.schema.properties[name];
    const typeProp = this.docType.properties ? this.docType.properties.filter((p) => p.name === name)[0] : null;

    if (origProp && origProp.format === 'date-time') {
      const isNotEmpty = (this.docData && this.docData[name] && this.docData[name] !== '');
      if (this.mode || isNotEmpty) {
        type = 'date-picker';
        // this.docType.schema.properties[name].pattern = '^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$';
        delete property.format; // иначе глючит контрол рендеринга формы

        if (isNotEmpty) {
          this.docData[name] = this.dateTimePipe.transform(this.docData[name], {format: 'yyyy-MM-dd'});
        }
      }
    }

    const propObj = {
      key: name,
      title: property.title,
      type: type,
      fieldHtmlClass: 'input-sm',
      btnHtmlClass: 'btn-sm'
    };

    if (property.type === 'integer' || property.type === 'number') {
      propObj.type = 'number';
    }
    if (typeProp && typeProp.type === 'textarea') {
      propObj.type = typeProp.type;
    }
    if (typeProp && typeProp.type.indexOf('typeahead') > -1) {
      propObj.type = 'typeahead';
      if (typeProp.type === 'query_typeahead') {
        propObj['typeahead'] = {server: true}
      }
    }

    layout.push(propObj);

  }


  prepareDocument(): Doc {
      const doc = new Doc({});
      const date = new Date();

      doc.id = this.docId || null;
      doc.type = this.docType.symbolicName;
      doc.title = this.liveFormData.title ? this.liveFormData.title + '' : date.toString();
      doc.description = this.liveFormData.description ? this.liveFormData.description : '';
      doc.baseType = this.baseType;

      delete this.liveFormData.title;
      delete this.liveFormData.description;

      doc.data = this.liveFormData;

      for (const propName in this.docType.schema.properties) {
        const prop = this.docType.schema.properties[propName];
        if (prop.format === 'date-time') {
          const val = doc.data[propName];
          if (val && val !== '') {
            doc.data[propName] = this.dateTimePipe.transform(val, {format: 'yyyy-MM-ddTHH:mm:ss'}) + 'Z';
          }
        }
        if (!doc.data[propName]) {
          if (this.docId && this.docData && this.docData[propName] && this.docData[propName] !== '') {
            doc.data[propName] = 'null'; // принудительное обнуление
          }
        }
      }

      return doc;
  }

  download(id?: string): void {
    this.apiService.downloadDocument(id || this.doc.id, this.docTypeId);
  }

  remove(): Observable<string> {
    let obs: Observable<Doc>;
    if (this.isSystem) {
      obs = this.apiService.removeSystemItem(this.docId);
    } else {
      obs = this.apiService.removeDocument(this.docId, this.docTypeId);
    }
    return obs
      .map(() => this.docId);
  }

  onTabOpen(tabName) {
   this.activeTabName = tabName;
  }

  private loadRenditions(): void {
    this.apiService.getCmisData(this.docId, 'type:rendition')
      // .catch((err) => {return Observable.of(null) })
      .subscribe((page: PagedList<CmisObject>) => {
        if (page && page.total > 0) {
          this.renditions = page.data.map((obj: CmisObject) => {
              return {id: obj.id, fileName: obj.data[CmisConstants.CMIS_PROP_FILE_NAME], fileSize: obj.data[CmisConstants.CMIS_PROP_FILE_SIZE] };
            }
          );
        }
      });
  }


}
