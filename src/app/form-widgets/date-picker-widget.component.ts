import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from 'angular2-json-schema-form';
import {DateFormatPipe} from '../pipes/date-format.pipe';

@Component({
  selector: 'app-date-picker-widget',
  template: `
    <div
      [class]="options?.htmlClass">      
      <label *ngIf="options?.title"
        [attr.for]="'control' + layoutNode?._id"
        [class]="options?.labelHtmlClass"
        [style.display]="options?.notitle ? 'none' : ''"
        [innerHTML]="options?.title"></label>
      <input *ngIf="options?.readonly" [class]="'form-control ' + options?.fieldHtmlClass" [value]="dispValue" readonly>
      <div class="{{options?.readonly ? '' : 'input-group'}}">
        <input bsDatepicker #valueControl="bsDatepicker" 
          [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"                    
          [attr.pattern]="options?.pattern"
          [attr.placeholder]="options?.placeholder"
          [attr.required]="options?.required"
          [class]="'form-control ' + options?.fieldHtmlClass + (options && options.readonly?' hidden ':'')"
          [disabled]="controlDisabled"          
          [id]="'control' + layoutNode?._id"
          [name]="controlName"
          [readonly]="options?.readonly ? 'readonly' : null"
          [minDate]="options?.minDate"
          [maxDate]="options?.maxDate"
          [value]="dispValue"
          (bsValueChange)="updateValue($event)"
          [bsConfig]="bsConfig"
          >        
        <div class="input-group-btn" *ngIf="!controlDisabled && !options?.readonly">
          <button [class]="'btn ' + options?.btnHtmlClass" type="button" (click)="valueControl.toggle()">
            <i class="glyphicon glyphicon-calendar"></i>
          </button>
        </div>
      </div>
      <input type="hidden" #inputControl [value]="controlValue"
             [attr.required]="options?.required"/>
    </div>`
})
export class DatePickerWidgetComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue: string;
  boundControl = true;
  controlDisabled: boolean = false;
  dispValue: string = '';
  options: any;
  autoCompleteList: string[] = [];
  @Input() formID: number;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  bsConfig: any = {containerClass: 'theme-default', dateInputFormat: 'DD.MM.YYYY'};

  constructor(
    private jsf: JsonSchemaFormService, private datePipe: DateFormatPipe
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {};
    this.jsf.initializeControl(this);
    if (this.controlValue && this.controlValue !== '') {
      try {
        this.dispValue = this.datePipe.transform(this.controlValue, {format: 'dd.MM.yyyy'});
      } catch (ex) {
        console.log('error ' + ex)
      }
    }
  }

  updateValue(event) {
    const newVal: Date = <Date>event;
    this.jsf.updateValue(this, this.datePipe.transform(newVal, {format: 'yyyy-MM-dd'}));
  }

}
