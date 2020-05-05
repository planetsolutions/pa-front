export class QuestionBase<T>{
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  minLength: number;
  maxLength: number;
  min: number;
  max: number;

  constructor(options: {
    value?: T,
    key?: string,
    label?: string,
    required?: boolean,
    order?: number,
    controlType?: string,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number
  } = {}) {
    this.value = options.value;
    this.minLength = options.minLength;
    this.maxLength = options.maxLength;
    this.min = options.min;
    this.max = options.max;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = false;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
  }
}
