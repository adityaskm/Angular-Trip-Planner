import { Component, OnInit, Input } from '@angular/core';
import { TimeCalcService } from '../../services/time-calc.service';

@Component({
  selector: 'app-timeframe',
  templateUrl: './timeframe.component.html',
  styleUrls: ['./timeframe.component.scss']
})
export class TimeframeComponent implements OnInit {
  @Input() startTime: string;
  @Input() endTime: string;
  duration = 0;
  remainingDuration = 0;
  minutes: number[] = [];
  times: string[] = [];
  lasttime = '';

  constructor(private timeCalc: TimeCalcService) {}

  ngOnInit() {
    this.divideTimeFrameByHours();
  }

  /**
   * @description Divide the Supplied Start Time and End Time into 2 hr intervls
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  divideTimeFrameByHours() {
    let currentTimeMinutes = this.timeCalc.calculateMinutesFromTime(
      this.startTime
    );
    this.minutes.push(currentTimeMinutes);
    this.remainingDuration = this.duration =
      this.timeCalc.calculateMinutesFromTime(this.endTime) -
      this.timeCalc.calculateMinutesFromTime(this.startTime);
    while (this.remainingDuration >= 60) {
      currentTimeMinutes += 60;
      this.remainingDuration -= 60;
      this.minutes.push(currentTimeMinutes);
    }
    this.times = this.minutes.map(minute =>
      this.timeCalc.calculateTimeFromMinutes(minute)
    );
    if (this.remainingDuration > 0) {
      this.lasttime = this.timeCalc.calculateTimeFromMinutes(
        currentTimeMinutes + this.remainingDuration
      );
    }
  }
}
