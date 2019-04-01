import { Pipe, PipeTransform } from '@angular/core';
import { TimeCalcService } from '../services/time-calc.service';

@Pipe({
  name: 'durationFormatter'
})
export class DurationFormatterPipe implements PipeTransform {
  constructor(private timeCalc: TimeCalcService) {}

  transform(value: number, args?: any): any {
    return this.timeCalc.calculateTimeFromMinutes(value) + 'hrs';
  }
}
