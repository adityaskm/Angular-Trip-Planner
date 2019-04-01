import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distanceFormatter'
})
export class DistanceFormatterPipe implements PipeTransform {
  transform(value: number, args?: any): any {
    return Math.floor(value) + 'km';
  }
}
