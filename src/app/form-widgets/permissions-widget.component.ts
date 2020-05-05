import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from 'angular2-json-schema-form';
import {ApiService} from '../services/api/api.service';
import {ListElement} from '../index';

@Component({
  selector: 'app-permissions-widget',
  template: `
    <div class="container-fluid col-xs-12 col-sm-10 col-md-8 col-lg-6">
      <table class="table table-striped table-condensed table-responsive">
        <thead>
        <tr valign="middle">
          <th style="width:150px" [translate]="'type.permissions.role'"></th>
          <th [translate]="'type.permissions.members'"></th>
        </tr>
        </thead>
        <tbody *ngIf="rolesValues" id="permissionsTable">
        <tr valign="middle"  *ngFor="let role of roles">
          <td [translate]="'roles.'+role"></td>
          <td><tags-input class="form-control input-sm" [removeLastOnBackspace]="true" style="overflow: unset"
                          name="tags_{{role}}" [placeholder]="'type.permissions.notSelected' | translate"
                          [options]="getSelectionList(role)" [displayField]="'name'"
                          [scrollableOptions]="true" (onTagsChanged)="onTagsChanged(role, $event)" [ngModel]="rolesValues[role]">
          </tags-input>
          </td>
        </tr>
        </tbody>
      </table>
    </div>`,
})
export class PermissionsWidgetComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue = '';
  controlDisabled = false;
  boundControl = false;
  options: any;
  roles: string[] = ['read', 'view_prop', 'edit_prop', 'change_content', 'modify_security', 'delete', 'full'];
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

    this.options = this.layoutNode.options || {};

    this.selectionList = this.options.selectionList;

    this.jsf.initializeControl(this);

    const fieldValue = this.controlValue;
    let value = {};
    if (fieldValue) {
      value = JSON.parse(fieldValue);
    }
    const rolesValues = {};
    this.roles.map(role => {
      rolesValues[role] = this.selectionList.filter((v: ListElement) => value[role] && value[role].indexOf(v.value) > -1)
    });
    this.rolesValues = rolesValues;

    setTimeout(function() {
      document.getElementById('permissionsTable').getElementsByTagName('input')[0].focus()
    }, 200)
  }

  onTagsChanged(roleName: string, info: {change: string, tag: ListElement}) {

    if (info.change === 'remove') {
      this.rolesValues[roleName] = this.rolesValues[roleName].filter( (v: ListElement) => v.value !== info.tag.value);
    }

    let result = {};
    let hasAny = false;
    this.roles.map(role => {
      result[role] = this.rolesValues[role].map(v => v.value);
      if (result[role].length > 0) {
        hasAny = true;
      }
    });
    if (!hasAny) {
      result = '';
    } else {
      result = JSON.stringify(result);
    }

    this.jsf.updateValue(this, result);
  }

  private unique (arr: ListElement[]) {
    const seen = {};
    return arr.filter(x => {
      if (seen[x.value]) {
        return
      }
      seen[x.value] = true;
      return x
    })
  }


  getSelectionList(roleName: string) {
    const selected = this.rolesValues[roleName].map(x => x.value);
    return this.selectionList.filter(x => selected.indexOf(x.value) === -1);
  }

}
