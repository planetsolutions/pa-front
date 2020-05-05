import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateTimeFormat'
})
export class DateTimeFormatPipe extends DatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let format = 'dd/MM/yyyy HH:mm:ss';
    if (args && args.format) {
      format = args.format;
    }
    return super.transform(value, format);
  }

}
