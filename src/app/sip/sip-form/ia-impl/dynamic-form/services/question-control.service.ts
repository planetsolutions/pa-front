import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionBase } from '../model/question-base';

@Injectable()
export class QuestionControlService {
  constructor() { }

  toFormGroup(questions: QuestionBase<any>[] ) {
    let group: any = {};
    let validators = [];

    questions.forEach(question => {
      validators = [];

      if (question.required) {
        validators.push(Validators.required);
      }
      if (question.maxLength !== undefined) {
        validators.push(Validators.maxLength(question.maxLength));
      }
      if (question.minLength !== undefined) {
        validators.push(Validators.minLength(question.minLength));
      }
      group[question.key] = new FormControl(question.value || '', validators);
    });
    return new FormGroup(group);
  }
}
