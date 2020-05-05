import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let format = 'dd/MM/yyyy';
    if (args && args.format) {
      format = args.format;
    }
    let val = null;
    try {
      val = super.transform(value, format);
    } catch (ex) {
      console.log(`could not transform date ${value}`);
      // console.exception(ex);
      val = value;
    }
    return val;
  }

}
