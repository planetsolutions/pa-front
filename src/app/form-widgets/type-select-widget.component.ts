import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from 'angular2-json-schema-form';
import {TypeSelectService} from '../type/type.service';
import {DocType} from '../index';

@Component({
  selector: 'app-type-select-widget',
  template: `
    <div
      [class]="options?.htmlClass">      
      <label *ngIf="options?.title"
        [attr.for]="'control' + layoutNode?._id"
        [class]="options?.labelHtmlClass"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></label>
      <div class="input-group">
        <input #valueControl
          [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
          [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
          [attr.maxlength]="options?.maxLength"
          [attr.minlength]="options?.minLength"
          [attr.pattern]="options?.pattern"
          [attr.placeholder]="options?.placeholder"
          [attr.required]="options?.required"
          [class]="'form-control ' + options?.fieldHtmlClass"
          [disabled]="controlDisabled"
          [id]="'control' + layoutNode?._id"
          [name]="controlName"
          [readonly]="options?.readonly ? 'readonly' : null"
          [type]="layoutNode?.type"
          [value]="dispValue"
          >
        <div class="input-group-btn">
          <button class="btn btn-default" type="button" (click)="selectType()" [attr.title]="'actions.select' | translate">
            <i class="glyphicon glyphicon-search"></i>
          </button>
        </div>
      </div>
      <input type="hidden" #inputControl [value]="controlValue"
             [attr.required]="options?.required"/>
    </div>`,
})
export class TypeSelectWidgetComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue: string = '';
  dispValue: string = '';
  controlDisabled: boolean = false;
  boundControl: boolean = false;
  options: any;
  autoCompleteList: string[] = [];
  @Input() formID: number;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    private jsf: JsonSchemaFormService,
    private typeSelectService: TypeSelectService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {};
    this.options.readonly = true;
    this.jsf.initializeControl(this);
    if (this.controlValue && this.controlValue !== '') {
      this.dispValue = this.controlValue.split('|')[0];
    }
  }


  selectType() {
    this.typeSelectService.select().subscribe((type: DocType) => {
      if(type) {
        this.jsf.updateValue(this, type.title + '|' + type.id);
        this.dispValue = type.title;
      }
    });
  }
}
