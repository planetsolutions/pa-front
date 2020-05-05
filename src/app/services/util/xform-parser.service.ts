import { Injectable } from '@angular/core';
import {FormElement} from '../api/model/form-element';

@Injectable()
export class XformParserService {
  private properties: any;
  private layout: any[];

  private formDoc: Document;

  constructor() { }

  public formToJson(xmlString: string): any {
    this.properties = {};
    this.layout = [];

    const parser = new DOMParser();
    this.formDoc = parser.parseFromString(xmlString, 'application/xml');

    const dataNodes = this.formDoc.getElementsByTagName('data');


    // проходим по элементам модели и создаем свойства формы
    if (dataNodes && dataNodes[0] && dataNodes[0].children.length > 0) {
      for (let i = 0; i < dataNodes[0].children.length; i ++) {
        // получили поле модели
        const fieldNode: Element = dataNodes[0].children[i];
        const fieldTag = fieldNode.tagName;
        const fieldLabel = this.getValueByDataTag('labels', fieldTag);
        if (fieldNode.children.length > 0) {
          // есть вложенные поля (период дат)
          const names = [];
          for (let k = 0; k < fieldNode.children.length; k ++) {
            const subFieldNode: Element = fieldNode.children[k];
            const dataKey = `/data/${fieldTag}/${subFieldNode.tagName}`;
            this.addProperty(dataKey);
            names.push(dataKey);
          }
          this.addPropGroupToLayout(names, fieldLabel);
        } else {
          this.addProperty(`/data/${fieldTag}`);
          this.addPropToLayout(`/data/${fieldTag}`, fieldLabel);
        }


      }
    }

    return {
      schema: {
        // type: 'object',
        properties: this.properties
      },
      layout: this.layout
    };
  }

  public decodeFieldName(name: string): string {
    return name.split('-').join('/');
  }

  private getValueByDataTag(containerElement: string, dataTagName: string): string {
    const node = this.formDoc.querySelector(containerElement + ' ' + dataTagName);
    if (node) {
      return node.textContent;
    } else {
      return '';
    }
  }

  private getFieldType(dataPath: string): string {
    const node = this.formDoc.querySelector(`bind[ref="${dataPath}"]`);
    if (node && node.getAttribute('type')) {
      const type = node.getAttribute('type');
      if(type === 'xforms:date') {
        return 'date-picker';
      }
    }

    return 'text';
  }

  private addProperty(name: string): void {
    this.properties[this.normalizeName(name)] = {type: 'string'};
  }


  private addPropToLayout(name: string, label: string): void {
    this.layout.push({
      key: this.normalizeName(name),
      title: label,
      type: this.getFieldType(name),
      fieldHtmlClass: 'input-sm'
    });
  }

  private addPropGroupToLayout(names: string[], label: string): void {
    const items = [];

    names.filter((name: string) => items.push({
      key: this.normalizeName(name),
      notitle: true,
      flex: '1 1 auto',
      type: this.getFieldType(name),
      fieldHtmlClass: 'input-sm'
    }));

    this.layout.push({
      type: 'div',
      title: label,
      'flex-direction': 'row',
      'displayFlex': true,
      //htmlClass: 'col-xs-4',
      items: items
    });
  }

  private normalizeName(name: string): string {
    // в json-form поиск элементов идет по пути и слэш все портит
    let arr = name.split('/');
    if (arr[0] === '') {
      arr = arr.splice(1);
    }
    if (arr[0] === 'data') {
      return arr.splice(1).join('-');
    } else {
      return arr.join('-');
    }
  }

}
