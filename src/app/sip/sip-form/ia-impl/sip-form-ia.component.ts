import {Component, ComponentFactoryResolver, EventEmitter, Input} from '@angular/core';
import {Element, Application, QuestionBase} from '../../../index';
import {FormGroup} from '@angular/forms';
import {QuestionControlService} from './dynamic-form/services/question-control.service';
import {XsdParserService} from '../../../services/util/xsd.parser.service';
import {ApiService} from '../../../services/api/api.service';
import {SipFormI} from '../sip-form-i';

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/zip';
import {Observable} from 'rxjs/Observable';


@Component({
  selector: 'app-sip-form-ia',
  templateUrl: './sip-form-ia.component.html',
  providers: [QuestionControlService],
})

export class SipFormIaComponent implements SipFormI {
  public application: Application;
  public docId: string;
  public mode: boolean;
  public onTitleChange: EventEmitter<string> = new EventEmitter<any>();
  public onValidChange: EventEmitter<boolean> = new EventEmitter<any>();
  public onAclSet: EventEmitter<any> = new EventEmitter();

  public questions: QuestionBase<any>[];
  public form: FormGroup;
  public attachments = [];
  public hasAttachments: boolean;
  private holdingName: string;
  private xmlns: string;
  private structure: Element;

  constructor(protected apiService: ApiService, private questionControlService: QuestionControlService,
              private xsdParserService: XsdParserService) {

  }

  onAfterCreated() {
    this.loadQuestions().subscribe((result: any) => {
      this.questions = result;
      this.form = this.questionControlService.toFormGroup(this.questions);
    });


    this.apiService.getApplicationHoldingName(this.application.uuid).subscribe(res => this.holdingName = res);
    this.apiService.getApplicationPdiSchemaName(this.application.uuid).subscribe(res => this.xmlns = res);

  }

  private loadQuestions (): Observable<any> {

    return this.apiService.getApplicationPdiSchemaContent(this.application.uuid)
      .map((xsdString: Response) => this.xsdParserService.parse(xsdString.toString()))
      .map(response => {
        this.structure = this.xsdParserService.parse(response).elements[0];
        // that.hasAttachments = this.structure.hasAttachments();

        //

        return Observable.from((response as any).questionArray());
      });
  }

  changeMode(editMode: boolean): void {
  }

  submit(): Observable<string> {
    const formValue = this.form.value;
    alert('not implemented!')
    return Observable.of('');
    /*this.pdiService.buildPdi(this.structure, this.xmlns, formValue, this.attachments);
        .flatMap((pdi) =>  this.pdiService.buildSip(this.holdingName, this.xmlns).zip([pdi]))
        .flatMap(([sip, pdi]) => this.pdiService.ingest(pdi, sip, this.attachments, this.application.uuid))
        .map((result) => <string>result.id );*/

  }


  remove(): Observable<string> {
    return null;
  }
}
