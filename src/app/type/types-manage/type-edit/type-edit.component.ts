import {Component, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy} from '@angular/core';
import {DocType, AccessGroup, SystemDoc, JsonFormConstants, UserInfo, ListElement} from '../../../index';
import {ApiService} from '../../../services/api/api.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {TranslateService} from '@ngx-translate/core';
import {TypeSelectWidgetComponent} from '../../../form-widgets/type-select-widget.component';
import {environment} from '../../../../environments/environment';
import {JsonSchemaFormComponent} from 'angular2-json-schema-form';
import {AlertsService} from '../../../alerts/alerts.service';
import {PermissionsWidgetComponent} from '../../../form-widgets/permissions-widget.component';
import {AuditWidgetComponent} from '../../../form-widgets/audit-widget.component';
import {Subject} from 'rxjs/Subject';
import {takeUntil} from 'rxjs/operators';
import {Doc} from "../../../services/api/model/doc";

@Component({
  selector: 'app-type-edit',
  templateUrl: './type-edit.component.html',
  styleUrls: ['./type-edit.component.css']
})
export class TypeEditComponent implements OnDestroy, OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject();
  private _type: DocType;
  private policies: Array<ListElement> = [];
  private policiesIds: Array<string> = [];

  private retPolicies: Array<ListElement> = [];
  private retPoliciesIds: Array<string> = [];

  private datasources: Array<ListElement> = [];
  private datasourcesIds: Array<string> = [];

  private liveFormData: any;
  private accessSelectionList: Array<ListElement> = [];
  private tabsSelectionList: Array<ListElement> = [];

  @Input() set type(type: DocType) {
    this._type = type;
    this.setTypeProperties();
  }

  @ViewChild(JsonSchemaFormComponent)
  private formComponent: JsonSchemaFormComponent;

  @Output() onSave: EventEmitter<DocType> = new EventEmitter<DocType>();

  public data: any = {};
  public schema: any;
  public widgets: any;
  public layout: any;
  public formIsValid = false;
  public isNew = true;

  public options: any = {
    addSubmit: false,
    loadExternalAssets: false, // Load external css and JavaScript for frameworks
    formDefaults: { feedback: false }, // Show inline feedback icons
    debug: false,
    returnEmptyFields: false
  };

  constructor(private apiService: ApiService, private translate: TranslateService, private alertsService: AlertsService) { }

  private setTypeProperties(): void {

    const data = {
      symbolicName: this._type.symbolicName || '',
      storagePolicy: this._type.storagePolicy || '',
      retentionPolicy: this._type.retentionPolicy || '-',
      access: this._type.access ? JSON.stringify(this._type.access) : '',
      audit: this._type.audit ? JSON.stringify(this._type.audit) : '',
      optionalTabs: this._type.optionalTabs  || [],
      title: this._type.title || '',
      parent: '',
      properties: this._type.properties || [],
      additionalProperties: (this._type.schema && this._type.schema.additionalProperties === false) ? true : false,
      datasource: this._type.datasource || '-'
    };

    if (data.retentionPolicy === '') data.retentionPolicy = '-';
    if (data.datasource === '') data.datasource = '-';

    const that  = this;

    const setData = function(_data) {

      that.data = _data;
      that.loadLists();
    }

    if (this._type.parent && this._type.parent !== environment.rootId) {
      this.apiService.getType(this._type.parent, true).subscribe((obj: DocType) => {
        data.parent = obj.title + '|' + obj.id;
        setData(data);
      });
    } else {
      setData(data);
    }

    this.isNew = !this._type.id;
    this.formIsValid = false;
  }

  private loadLists (): void {
    const task1: Observable<AccessGroup[]> = this.apiService.getGroups();
    const task2: Observable<SystemDoc[]> = this.apiService.getSystemDocs('storage_policy');
    const task3: Observable<UserInfo[]> = this.apiService.getUsers();
    const task4: Observable<SystemDoc[]> = this.apiService.getSystemDocs('retention_policy');
    const task5: Observable<SystemDoc[]> = this.apiService.getSystemDocs('tabs_config');
    const task6: Observable<string[]> = this.apiService.getDatasources();

    Observable.forkJoin(task1, task2, task3, task4, task5, task6)
      .subscribe((result: [AccessGroup[], SystemDoc[], UserInfo[], SystemDoc[], SystemDoc[], string[]]) => {
      const groups = result[0].map((obj: AccessGroup) => new ListElement(obj.title, obj.id));
      const users = result[2].map((obj: UserInfo) => new ListElement(obj.fullName || obj.id, obj.id));

      this.accessSelectionList = users.concat(groups);

      if (result[4] && result[4].length > 0) {
        this.tabsSelectionList = result[4].map((obj: SystemDoc) => new ListElement(obj.title, obj.symbolicName));
      }

      this.policies = result[1].map((obj: SystemDoc) => new ListElement(obj.title, obj.symbolicName));
      this.policiesIds = this.policies.map((value: ListElement) => value.value);
      this.policies.push(new ListElement(' ', ''));
      this.policiesIds.push('');

      this.retPolicies = result[3].map((obj: SystemDoc) => new ListElement(obj.title, obj.symbolicName));
      this.retPoliciesIds = this.retPolicies.map((value: ListElement) => value.value);
      this.retPolicies.push(new ListElement(' ', '-'));
      this.retPoliciesIds.push('-');

      this.datasources = result[5].map((obj: string) => new ListElement(obj, obj));
      this.datasourcesIds = this.datasources.map((value: ListElement) => value.value);
      if (this.datasourcesIds[0] !== '') {
        this.datasources.push(new ListElement(' ', '-'));
        this.datasourcesIds.push('-');
      }

      this.initForm();
    });
  }

  ngOnInit() {

  }

  private initForm(): void {
    this.widgets = {
      'type-select': TypeSelectWidgetComponent,
      'permissions': PermissionsWidgetComponent,
      'audit': AuditWidgetComponent
    };

    const schema = {
      'type': 'object',
      'title': 'schema',
      'properties': {
        'title': {'type': 'string'},
        'symbolicName': {'type': 'string'},
        'storagePolicy': { 'type': 'string', enum: this.policiesIds },
        'retentionPolicy': { 'type': 'string', enum: this.retPoliciesIds },
        'datasource': { 'type': 'string', enum: this.datasourcesIds },
        'parent': { 'type': 'string' },
        'access': {
          'type': 'string'
        },
        'audit': {
          'type': 'string'
        },
        'optionalTabs': {
          'type': 'array',
          'items': {
            'type': 'string', enum: (this.tabsSelectionList.length === 0 ? null : this.tabsSelectionList.map((v: ListElement) => v.value))
          }
        },
        'properties': {
          'type': 'array',
          'add': 'add',
          'items': {
            'type': 'object',
            'properties': {
              'isRequired': {'type': 'boolean'},
              'name': {'type': 'string'},
              'title': {'type': 'string'},
              'type': {'type': 'string', 'enum': [ 'string', 'integer', 'number', 'date', 'textarea', 'typeahead', 'query_typeahead', '' ]}
            },
            'required': [
              'name',
              'title',
              'type'
            ]
          }
        },
        'additionalProperties': {'type': 'boolean'}
      },
      'required': [ 'title', 'symbolicName', 'storagePolicy', 'access', 'retentionPolicy', 'datasource' ]
    };

    const layout = [
      { 'type': 'flex', 'flex-flow': 'row wrap', 'items': [
         {'key': 'title', 'title': this.translate.instant('type.title'), 'flex': '7 7'},
         {'key': 'symbolicName', 'title': this.translate.instant('type.symbolic'), 'flex': '5 5'}
       ]},


      { 'type': 'flex', 'flex-flow': 'row wrap', 'items': [
        {'key': 'datasource', 'title': this.translate.instant('type.datasource'), titleMap: this.datasources},
        {'key': 'storagePolicy', 'title': this.translate.instant('type.storagePolicy'), titleMap: this.policies},
        {'key': 'retentionPolicy', 'title': this.translate.instant('type.retentionPolicy'), titleMap: this.retPolicies}
       ] },

      {'key': 'parent', 'title': this.translate.instant('type.parent'), 'type': 'type-select'},

      {
        'type': 'tabs',
        'tabs': [
          {
            'title': this.translate.instant('type.properties'),
            'items': [
              {
                'key': 'properties',
                'type': 'array',
                'notitle': true,
                'items': [{

                  'type': 'div',
                  'displayFlex': true,
                  'flex-direction': 'row',
                  'items': [
                    {
                      key: 'properties[].isRequired', title: this.translate.instant('type.attr.required')
                    },
                    {
                      'key': 'properties[].title', 'flex': '4 4 200px',
                      'notitle': true, 'placeholder': this.translate.instant('type.attr.title')
                    },
                    {
                      'key': 'properties[].name', 'flex': '4 4 200px',
                      'notitle': true, 'placeholder': this.translate.instant('type.attr.id')
                    },
                    {
                      'key': 'properties[].type', 'flex': '2 2 100px',
                      'notitle': true,
                      'titleMap': [
                        {'name': this.translate.instant('type.attr.string'), 'value': 'string'},
                        {'name': this.translate.instant('type.attr.number'), 'value': 'number'},
                        {'name': this.translate.instant('type.attr.integer'), 'value': 'integer'},
                        {'name': this.translate.instant('type.attr.date'), 'value': 'date'},
                        {'name': this.translate.instant('type.attr.textarea'), 'value': 'textarea'},
                        {'name': this.translate.instant('type.attr.typeahead'), 'value': 'typeahead'},
                        {'name': this.translate.instant('type.attr.query_typeahead'), 'value': 'query_typeahead'},
                        {'name': ' ', 'value': ''}
                      ]
                    }
                  ]
                }]
              }
            ]
          },
          {
            'title': this.translate.instant('type.permissions.title') + ' <strong class="text-danger">*</strong>',
            'items': [
              {
                key: 'access',
                type: 'permissions',
                notitle: true,
                selectionList: this.accessSelectionList
              }
            ]
          },
          {
            'title': this.translate.instant('type.audit.title'),
            'items': [
              {
                key: 'audit',
                type: 'audit',
                notitle: true
              }
            ]
          }

        ]
      },
      {'key': 'additionalProperties', 'title': this.translate.instant('type.additionalProperties')},

    ];

    if (this.tabsSelectionList.length > 0) {
      layout[3]['tabs'].push(
      {
        'title': this.translate.instant('type.tabs'),
        'items': [
        {
          key: 'optionalTabs',
          type: 'checkboxes',
          notitle: true,
          titleMap: this.tabsSelectionList
        }
      ]
      })
    } else {
      delete schema.properties.optionalTabs;
    }
    this.schema = schema;
    this.layout = layout;
  }

  onChanges(data) {
    if (data.storagePolicy === '') {
      data.storagePolicy = 'default_policy';
    }
    if (data.properties && data.properties.length > 0) {
      for (let i = 0; i < data.properties.length; i++) {
        if (data.properties[i].type === '') {
          data.properties[i].type = 'string';
        }
        data.properties[i].isRequired = !!data.properties[i].isRequired
      }
    }
    this.liveFormData = data;
  }

  submit() {
    const data = this.liveFormData;
    const resprops = data.properties || [];
    const resprop = {};
    const requiredProps = [];

    let index = 0;

    for (let i = 0; i < resprops.length; i++) {
      if (resprops[i].title !== '') {
        resprop[resprops[i].name] = {
          title: resprops[i].title,
          index: index ++
        };
        if (JsonFormConstants.VALID_TYPES.indexOf(resprops[i].type) > -1) {
          resprop[resprops[i].name].type = resprops[i].type;
        } else {
          resprop[resprops[i].name].type = 'string';
          if (resprops[i].type === 'date') {
            resprop[resprops[i].name].format = JsonFormConstants.FORMAT_DATE;
          }
        }
        if (resprops[i].isRequired) {
          requiredProps.push(resprops[i].name);
        }
      }
    }
    const docTypeSave: any = {};

    const parentId = data.parent && data.parent !== '' ? data.parent.split('|')[1] : environment.rootId;

    docTypeSave.title = data.title;
    docTypeSave.type = 'type';
    docTypeSave.symbolicName = data.symbolicName;
    docTypeSave.parent = parentId;
    docTypeSave.data = {
      storage_policy: data.storagePolicy,
      retention_policy: (data.retentionPolicy === '-' ? '' : data.retentionPolicy),
      symbolicName: data.symbolicName,
      parent: parentId,
      properties: data.properties,
      access: (data.access && data.access !== '' ? JSON.parse(data.access) : undefined),
      audit: (data.audit && data.audit !== '' ? JSON.parse(data.audit) : undefined),
      optionalTabs: data.optionalTabs,
      datasource: (data.datasource === '-' ? '' : data.datasource),
      schema: {
        properties: resprop,
        type: 'object',
        required: requiredProps
      }
    };

    if (data.additionalProperties === true) {
      docTypeSave.data.schema.additionalProperties = false;
    }

    if (this._type.id) {
      docTypeSave.id = this._type.id;
    }

    this.apiService.saveType(docTypeSave).subscribe(() => {
      this.onSave.emit(docTypeSave);
    });

  }

  isValid(value) {
    if (!this.liveFormData) {
      value = false;
    } else {
      const that = this;
      (['title', 'symbolicName', 'storagePolicy', 'access', 'datasource']).filter(function(nm) {
        if (!that.liveFormData[nm] || that.liveFormData[nm] === '' || that.liveFormData[nm][0] === '') {
          value = false;
        }
      });
    }
    this.formIsValid = value;
  }

  onValidationErrors(data) {
    if (data) {
       // console.log(data);
    }
  }

  remove() {
    this.apiService.getTypes(this._type.id).subscribe((data: DocType[]) => {
     if (data.length > 0) {
       this.alertsService.info({title: 'actions.remove', text: 'type.alerts.removeWithChildren'})
     } else {
       this.apiService.getTypeDocs(this._type.symbolicName).subscribe((data2: Doc[]) => {
         if (data2.length > 0) {
           this.alertsService.info({title: 'actions.remove', text: 'type.alerts.removeWithDocs'})
         } else {

           this.alertsService.confirm({title: 'actions.remove', text: 'document.confirm.remove'})
             .pipe(takeUntil(this.ngUnsubscribe)).subscribe((result) => {
             if (result === 'yes') {
               this.apiService.removeSystemItem(this._type.id).subscribe(() => {
                 this.onSave.emit(null);
               });
             }
           })
         }
       })
     }
    })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

