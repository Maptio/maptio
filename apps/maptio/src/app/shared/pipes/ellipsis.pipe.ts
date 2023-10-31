import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
  standalone: true,
})
export class EllipsisPipe implements PipeTransform {
  transform(value: string, desiredLength: number) {
    if (desiredLength === undefined) {
      return value;
    }

    if (value.length > desiredLength) {
      return value.substring(0, desiredLength) + '...';
    } else {
      return value;
    }
  }
}
