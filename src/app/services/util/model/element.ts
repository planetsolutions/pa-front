
import {Observable} from 'rxjs/Observable';
import {QuestionBase} from '../../../sip/sip-form/ia-impl/dynamic-form/model/question-base';
import {TextboxQuestion} from '../../../sip/sip-form/ia-impl/dynamic-form/model/question-textbase';
export class Element {
  public elements = [];
  public type: string;
  public name: string;
  public min: number;
  public max: number;
  public minLength: number;
  public maxLength: number;

  constructor(name?: string, type?: string) {
    this.name = name;
    this.type = type;
  }

  public size(): number {
    let size = 0;
    size = this.countSize(size, this);
    return size;
  }

  public sizeWithoutAttachments(): number {
    let size = 0;
    size = this.countSizeWithoutAttachments(size, this);
    return size;
  }

  countSize(size: number, element: Element): number {
    length = element.elements.length;
    for (let i = 0; i < length; i++) {
      if (element.elements[i] !== undefined) {
        if (element.elements[i].type !== 'xs:complexType') {
          size++;
        } else {
          size = this.countSize(size, element.elements[i]);
        }
      }
    }
    return size;
  }

  countSizeWithoutAttachments(size: number, element: Element): number {
    length = element.elements.length;
    for (let i = 0; i < length; i++) {
      if (element.elements[i] !== undefined && element.elements[i].name.toLowerCase() !== 'attachments') {
        if (element.elements[i].type !== 'xs:complexType') {
          size++;
        } else {
          size = this.countSizeWithoutAttachments(size, element.elements[i]);
        }
      }
    }
    return size;
  }

  questionArray(): QuestionBase<any>[] {
    let questions: QuestionBase<any>[] = [];
    questions = this.pushQuestion(questions, this, 1);
    // console.log(questions);
    return questions;
  }

  pushQuestion(questions: QuestionBase<any>[], element: Element, k: number): QuestionBase<any>[] {
    length = element.elements.length;
    for (let i = 0; i < length; i++) {
      if (element.elements[i] !== undefined && element.elements[i].name.toLowerCase() !== 'attachments') {
        if (element.elements[i].type !== 'xs:complexType') {
          switch (element.elements[i].type) {
            case 'xs:date':
              questions.push(new TextboxQuestion({
                key: element.elements[i].name,
                label: element.elements[i].name,
                value: '',
                required: true,
                order: k,
                minLength: element.elements[i].minLength,
                maxLength: element.elements[i].maxLength,
                min: element.elements[i].min,
                max: element.elements[i].max,
                type: 'date'
              }));
              break;
            // TODO: normal datetime field and format
            case 'xs:dateTime':
              questions.push(new TextboxQuestion({
                key: element.elements[i].name,
                label: element.elements[i].name,
                required: true,
                order: k,
                minLength: element.elements[i].minLength,
                maxLength: element.elements[i].maxLength,
                min: element.elements[i].min,
                max: element.elements[i].max,
                type: 'text',
                value: '2016-08-09T16:57:23.329+05:30'
              }));
              break;
            case 'xs:positiveInteger':
            case 'xs:int':
              questions.push(new TextboxQuestion({
                key: element.elements[i].name,
                label: element.elements[i].name,
                value: '',
                required: true,
                order: k,
                minLength: element.elements[i].minLength,
                maxLength: element.elements[i].maxLength,
                min: element.elements[i].min,
                max: element.elements[i].max,
                type: 'number'
              }));
              break;
            default:
              questions.push(new TextboxQuestion({
                key: element.elements[i].name,
                label: element.elements[i].name,
                value: '',
                required: true,
                order: k,
                minLength: element.elements[i].minLength,
                maxLength: element.elements[i].maxLength,
                min: element.elements[i].min,
                max: element.elements[i].max
              }));
              break;
          }
          k++;
        } else {
          questions = this.pushQuestion(questions, element.elements[i], k);
        }
      }
    }
    return questions;
  }

  toString() {
    return ' Name = ' + this.name + '; Type = ' + this.type + '; Elements: ' + this.elements.toString();
  }

  hasAttachments(): boolean {
    return this.size() !== this.sizeWithoutAttachments();
  }
}

