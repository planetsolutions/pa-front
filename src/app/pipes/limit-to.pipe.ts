import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitTo'
})
export class LimitToPipe implements PipeTransform {

  transform(arr: any[], size: number): any[] {
    if (!arr || arr.length < size) return arr;

    return size > 0 ? arr.slice(0, size) : arr.slice(-size);
  }

}
