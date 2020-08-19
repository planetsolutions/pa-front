import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from 'angular2-json-schema-form';
import {Observable} from 'rxjs/Observable';
import {ApiService} from '../services/api/api.service';
import {ListElement} from '../services/api/model/list-element';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-typeahead-widget',
  template: `
    <div [class]="options?.htmlClass || ''">
      <label *ngIf="options?.title"
        [attr.for]="'control' + layoutNode?._id"
        [class]="options?.labelHtmlClass || ''"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></label>
      <input *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [attr.placeholder]="options?.placeholder"
        [attr.required]="options?.required"
        [class]="options?.fieldHtmlClass || ''"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [readonly]="options?.readonly ? 'readonly' : null"
        [typeahead]="dataSource"
        [typeaheadOptionsLimit]="10"
        typeaheadOptionField="name"
        typeaheadWaitMs="1000"
        [type]="layoutNode?.type">
      <input *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [attr.placeholder]="options?.placeholder"
        [attr.required]="options?.required"
        [class]="options?.fieldHtmlClass || ''"
        [disabled]="controlDisabled"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [readonly]="options?.readonly ? 'readonly' : null"
        [type]="layoutNode?.type"
        [value]="controlValue"
        [typeahead]="dataSource"
        [typeaheadOptionsLimit]="10"
        typeaheadOptionField="name"
        typeaheadWaitMs="1000"
        (input)="updateValue($event)">
    </div>`,
})
export class TypeaheadWidgetComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue: string;
  controlDisabled = false;
  boundControl = false;
  options: any;
  dataSource: Observable<any>;
  listSubject: BehaviorSubject<ListElement[]> = null;

  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    private jsf: JsonSchemaFormService,
    private api: ApiService
  ) {
    this.dataSource = Observable.create((observer: any) => {
      // Runs on every search
      observer.next(this.controlValue);
    }).mergeMap((token: string) => this.searchValues(token));
  }

  ngOnInit() {
    this.options = this.layoutNode.options || {};
    this.jsf.initializeControl(this);
  }

  updateValue(event) {
    this.jsf.updateValue(this, event.target.value);
  }

  private searchValues(token: string): Observable<any> {

    let searchType = null;

    if (!!this.jsf.formOptions.customOptions) {
      searchType = this.jsf.formOptions.customOptions.type
    }

    if (!searchType) {
      console.error('this.searchType is undefined!');
      //return Observable.of([]);
    }

    if (this.options.typeahead && this.options.typeahead.server) {
      if (!token || token === '') {
        return Observable.of([]);
      } else if (searchType) {
        return this.api.getUsedFieldValues(searchType, this.controlName, token);
      }
    }

    if (!this.listSubject) {
      this.listSubject = new BehaviorSubject([]);
      if (this.options.typeahead && this.options.typeahead.predefined) {
        const values = this.options.typeahead.predefined.map((value) => {
          return new ListElement(value, value)
        });
        Observable.of([]).delay(100).subscribe(() => {
          this.listSubject.next(values);
        });

      } else if (searchType) {
        this.api.getUsedFieldValues(searchType, this.controlName).subscribe((result) => {
          this.listSubject.next(result);
        })
      } else {
        return Observable.of([]);
      }
    }

    // const query = new RegExp(token, 'ig');

    return this.listSubject.switchMap( (result: ListElement[]) => Observable.of(
      result.filter((elem: ListElement) => {
        return (elem && elem.name && elem.name.toLowerCase().startsWith(token.toLowerCase()));
      })
    ))
  }
}
