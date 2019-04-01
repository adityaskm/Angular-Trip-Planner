import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeCalcService {
  constructor() {}

  calculateMinutesFromTime(timeString: string): number {
    const minutes = timeString.split(':');
    return parseInt(minutes[0], 10) * 60 + parseInt(minutes[1], 10);
  }

  calculateTimeFromMinutes(minutes: number): string {
    const startTimeHours = Math.floor(minutes / 60);
    const startTimeMinutes = Math.floor(minutes % 60);
    const startTimeHoursString =
      startTimeHours < 10 ? '0' + startTimeHours : '' + startTimeHours;
    const startTimeMinutesString =
      startTimeMinutes < 10 ? '0' + startTimeMinutes : '' + startTimeMinutes;
    const timeString =
      startTimeHoursString + ':' + startTimeMinutesString + ':00';
    return timeString;
  }

  calculateDuration(startTime: string, endTime: string) {
    return (
      this.calculateMinutesFromTime(endTime) -
      this.calculateMinutesFromTime(startTime)
    );
  }
}
