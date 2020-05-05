import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from 'angular2-json-schema-form';
import {ApiService} from '../services/api/api.service';
import {ListElement} from '../index';

@Component({
  selector: 'app-audit-widget',
  template: `
    <div class="container-fluid col-xs-12 col-sm-10 col-md-8 col-lg-6">
      <table class="table table-striped table-condensed table-responsive" style="width:450px">
        <thead>
        <tr valign="middle">
          <th style="width:150px">&nbsp;</th>
          <th style="width:100px" class="text-center" [translate]="'type.audit.event'"></th>
          <th style="width:100px" class="text-center" [translate]="'type.audit.timing'"></th>
        </tr>
        </thead>
        <tbody>
        <tr valign="middle"  *ngFor="let role of roles">
          <td [translate]="'type.audit.'+role"></td>
          <td class="text-center">
            <input type="checkbox" value="1" (click)="checkBoxClick($event, role, 'event')" [checked]="rolesValues[role]?.event">
          <td class="text-center">
            <input type="checkbox" value="1" (click)="checkBoxClick($event, role, 'timing')"
                   [checked]="rolesValues[role]?.timing && rolesValues[role]?.event"
                   [disabled]="!rolesValues[role] || !rolesValues[role].event">
          </td>
        </tr>
        </tbody>
      </table>
    </div>`,
})
export class AuditWidgetComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue = '';
  controlDisabled = false;
  boundControl = false;
  options: any;
  roles: string[] = ['read', 'create', 'update', 'delete'];
  selectionList = [];
  rolesValues: any = null;
  @Input() formID: number;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    private jsf: JsonSchemaFormService, private apiService: ApiService
  ) {}

  ngOnInit() {

    this.jsf.initializeControl(this);

    const fieldValue = this.controlValue;
    let value = {};
    if (fieldValue) {
      value = JSON.parse(fieldValue);
    }
    const rolesValues = {};
    this.roles.map(role => rolesValues[role] = {});
    this.roles.map(role => {
      rolesValues[role].event = (value[role] && value[role].event === true ? true : false);
      rolesValues[role].timing = (value[role] && value[role].timing === true && value[role].event === true ? true : false);
    });
    this.rolesValues = rolesValues;

  }

  checkBoxClick(ev, roleName: string, type: string) {
    const inp = (ev.srcElement || ev.target);
    this.rolesValues[roleName][type] = inp.checked;

    if (!this.rolesValues[roleName].event) {
      this.rolesValues[roleName].timing = false;
    }

    const result = JSON.stringify(this.rolesValues);
    this.jsf.updateValue(this, result);
  }

}
