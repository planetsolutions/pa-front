import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {XForm, XFormSubmissionSerializer} from '../../../index';
import {XformParserService} from '../../../services/util/xform-parser.service';
import {TypeSelectWidgetComponent} from '../../../form-widgets/type-select-widget.component';
import {DatePickerWidgetComponent} from '../../../form-widgets/date-picker-widget.component';
import {BsModalRef} from 'ngx-bootstrap';
import {TypeaheadWidgetComponent} from '../../../form-widgets/typeahead-widget.component';
import {JsonSchemaFormComponent} from "angular2-json-schema-form";

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']

})
export class SearchFormComponent implements OnInit {
  public formReady = false;
  public form: any;
  public widgets: any;
  public formIsValid: boolean = null;
  public defaultData: any = {};
  private liveFormData: any = {};
  public searchTitle;
  public maxHeight = 0;
  private usedXForm: XForm;

  @Output() submit: EventEmitter<{query: string, formData: any}> = new EventEmitter<{query: string, formData: any}>();

  @Input() set xform(value: XForm) {
    this.usedXForm = value;
    this.initForm(value);
  }

  @ViewChild('formControl')
  public formControlRef: JsonSchemaFormComponent;

  public jsonFormOptions: any = {
    addSubmit: false,
    loadExternalAssets: false, // Load external css and JavaScript for frameworks
    formDefaults: { feedback: true }, // Show inline feedback icons
    debug: false,
    returnEmptyFields: false,
    customOptions: {}
  };

  constructor(private parserService: XformParserService, public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.maxHeight = window.innerHeight - 250;
    if(this.maxHeight < 200){
      this.maxHeight = 200;
    }
  }

  private initForm(xform: XForm) {
    if (!xform) return;

    let form;

    if (xform.searchData && xform.searchData['search_form']) {
      form = xform.searchData['search_form'];
      this.jsonFormOptions.customOptions['type'] = xform.searchData['type'];
      console.log('json form used');

    } else {
      console.log('xform used');
      form = this.parserService.formToJson(xform.form);
      console.log(JSON.stringify(form));
      // form['form'] = this.getInlineLayout(form);
    }

    for (const prop in form.schema.properties) {
      if (!this.defaultData[prop]) {
        this.defaultData[prop] = '';
      }
    }

    form['data'] = this.defaultData;
    this.widgets = {
      'type-select': TypeSelectWidgetComponent,
      'date-picker': DatePickerWidgetComponent,
      'typeahead': TypeaheadWidgetComponent
    };
    this.form = form;
    this.formReady = true;
  }

  onFormChanges(data: any) {
    this.liveFormData = data;
  }

  doSubmit() {
    // const submission: XMLDocument = this.form.getModels()[0].getInstances()[0].getInstanceDocument();
    const submission: Document = document.implementation.createDocument(null, null, null);
    const root: Element = submission.createElement('data');
    submission.insertBefore(root, null);
    // console.log(this.form)
    for (const prop in this.liveFormData) {
      const fieldName = this.parserService.decodeFieldName(prop);
      let elem: Element = null;
      const layoutNode = this.findControlInLayout(this.form.layout, prop);
      if (fieldName.indexOf('/') > -1) {
        const fieldTag = fieldName.split('/')[0];
        elem = submission.getElementsByTagName(fieldTag)[0];
        if(!elem){
          elem = submission.createElement(fieldTag);
        }
        const child: Element = submission.createElement(fieldName.split('/')[1]);
        child.innerHTML = this.liveFormData[prop];
        if (layoutNode && layoutNode.type === 'date-picker') {
          if (child.tagName === 'from') {
            child.innerHTML += ' 00:00:00'
          }
          if (child.tagName === 'to') {
            child.innerHTML += ' 23:59:59'
          }
        }

        elem.insertBefore(child, null);
      } else {
        elem = submission.createElement(this.parserService.decodeFieldName(prop));
        elem.innerHTML = this.liveFormData[prop];
        const eqArr = ['typeahead', 'number', 'integer'];
        if (
          (layoutNode && eqArr.indexOf(layoutNode.type) > -1) ||
          this.form.schema.properties[prop].enum ||
          layoutNode.titleMap
        ) {
          elem.setAttribute('operator', 'EQUAL')
        } else if (layoutNode && layoutNode.type === 'date-picker') {
          elem.innerHTML = '<from>' + this.liveFormData[prop] + ' 00:00:00</from><to>' + this.liveFormData[prop] + ' 23:59:59</to>';
        }
      }
      root.insertBefore(elem, null);
    }
    if (root.childNodes.length > 0) {
      const serializer = new XFormSubmissionSerializer();
      this.bsModalRef.hide();

      this.submit.emit({query: serializer.serialize(submission), formData: this.liveFormData});

    }


  }

  clean(): void {
    this.defaultData = {};
    this.initForm(this.usedXForm);

  }

  private getInlineLayout(form): Array<any> {
    const layout = [];
    let propCount = 0;
    for (const prop in form.schema.properties) {
      propCount ++;
    }
    let colWidth: number = Math.round(12 / propCount);
    if (colWidth < 1) { colWidth = 1; };

    for (const prop in form.schema.properties) {
      layout.push({
        key: prop,
        htmlClass: 'col-xs-' + colWidth,
        fieldHtmlClass: 'input-sm'
      });
    }

    return layout;
  }

  private findControlInLayout(obj, name): any {
    if (obj.key === name) { return obj; }
    for (const i in obj) {
      if (obj.hasOwnProperty(i) && (typeof obj[i] === 'object' || obj[i].constructor === Array)) {
        const foundLabel = this.findControlInLayout(obj[i], name);
        if (foundLabel) { return foundLabel; }
      }
    }
    return null;
  };
}
