import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeCalcService {
  constructor() {}

  /**
   * @description Supply time in the format of hh.mm.ss or hh.mm and this function returns the time in minutes from 00:00:00
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculateMinutesFromTime(timeString: string): number {
    const minutes = timeString.split(':');
    return parseInt(minutes[0], 10) * 60 + parseInt(minutes[1], 10);
  }

  /**
   * @description Supply a time in minutes from 00:00:00 and this function returns the time in 24 hr format
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculateTimeFromMinutes(minutes: number): string {
    const startTimeHours = Math.floor(minutes / 60);
    const startTimeMinutes = Math.floor(minutes % 60);
    const startTimeHoursString =
      startTimeHours < 10 ? '0' + startTimeHours : '' + startTimeHours;
    const startTimeMinutesString =
      startTimeMinutes < 10 ? '0' + startTimeMinutes : '' + startTimeMinutes;
    const timeString = startTimeHoursString + ':' + startTimeMinutesString;
    return timeString;
  }

  /**
   * @description Calculates the duration between 2 formatted 24hr times
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculateDuration(startTime: string, endTime: string) {
    return (
      this.calculateMinutesFromTime(endTime) -
      this.calculateMinutesFromTime(startTime)
    );
  }
}
