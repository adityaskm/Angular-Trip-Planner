import { Component, OnInit, NgZone } from '@angular/core';
import { ConstantsService } from 'src/app/shared/services/constants.service';
import { Place } from 'src/app/shared/interfaces/interface';
import { DataService } from 'src/app/shared/services/data.service';
import { TimeCalcService } from 'src/app/shared/services/time-calc.service';
import { DropEvent } from 'ng-drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaceComponent } from 'src/app/shared/components/add-place/add-place.component';
import { ErrorModalComponent } from 'src/app/shared/components/error-modal/error-modal.component';
import { LatLngLiteral } from '@agm/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  places: Place[] = [];

  timelinePlaces: Place[] = [];

  timeLineMarkers: LatLngLiteral[];

  timeline = {
    startTime: '08:00',
    endTime: '16:00',
    geocodes: {
      lat: this.constants.mapConstants.lat,
      lng: this.constants.mapConstants.lng
    },
    places: this.timelinePlaces,
    valid: true
  };

  constructor(
    public constants: ConstantsService,
    private dataService: DataService,
    private timeCalc: TimeCalcService,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getMapData();
  }

  /**
   * @description Get the Open places. The user May add by Clicking on the Plus Button as Well
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  getMapData() {
    this.dataService.getMapData().subscribe(data => {
      if (data.hasError === false) {
        this.places = data.data;
      }
    });
  }

  /**
   * @description Insert newly Created place into the open places array if its name, address and location doesn't already exist
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  insertNewPlace(place: Place) {
    const placeError = this.analyseIfPlaceExists(place);
    placeError === ''
      ? this.places.push(place)
      : this.errorModalOpen(placeError);
  }

  /**
   * @description A Universal error Modal For showing any error
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  errorModalOpen(errorMsg: string) {
    this.dialog.open(ErrorModalComponent, {
      width: '60%',
      data: errorMsg
    });
  }

  /**
   * @description Analyse if a place exists based on its name, Address and the location on the Map
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  analyseIfPlaceExists(place: Place): string {
    const placeError = {
      name: false,
      address: false,
      geocodes: false
    };
    const error =
      this.places.some(
        placeObj =>
          (placeError.geocodes =
            placeObj.geocodes.lat === place.geocodes.lat &&
            placeObj.geocodes.lng === place.geocodes.lng) ||
          (placeError.name = placeObj.name === place.name) ||
          (placeError.address = placeObj.address === place.address)
      ) ||
      this.timelinePlaces.some(
        placeObj =>
          (placeError.geocodes =
            placeObj.geocodes.lat === place.geocodes.lat &&
            placeObj.geocodes.lng === place.geocodes.lng) ||
          (placeError.name = placeObj.name === place.name) ||
          (placeError.address = placeObj.address === place.address)
      );
    if (error) {
      if (placeError.name) {
        return 'A Place with the Same Name Exists';
      }
      if (placeError.address) {
        return 'A Place with the Same Address Exists';
      }
      if (placeError.geocodes) {
        return 'A Place with the Same Location Exists';
      }
    } else {
      return '';
    }
  }

  /**
   * @description Insert Place into the Timeline if it does not exist
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  insertPlaceInTimeline(place: Place) {
    if (this.timelinePlaces.indexOf(place) === -1) {
      this.timelinePlaces.push(place);
    }
  }

  /**
   * @description Sort the Places in the Timeline Based on the Start Time.
   *  (This is just for internal purposes. It does not affect external representation)
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  sortPlacesInTimeline() {
    this.timelinePlaces.sort(
      (a, b) =>
        this.timeCalc.calculateMinutesFromTime(a.startTime) -
        this.timeCalc.calculateMinutesFromTime(b.startTime)
    );
  }

  /**
   * @description Calculate the place end time from the duration (Currently fixed at 60) and the Start Time
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculateEndTimeFromStartTime(place: Place) {
    place.endTime = this.timeCalc.calculateTimeFromMinutes(
      this.timeCalc.calculateMinutesFromTime(place.startTime) + 60
    );
  }

  /**
   * @description Open an Angular Material Modal for adding a Place
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  openPlaceModal() {
    const dialogRef = this.dialog.open(AddPlaceComponent, {
      width: '60%',
      data: new Place(this.constants)
    });

    dialogRef.afterClosed().subscribe((result: Place) => {
      if (result) {
        this.insertNewPlace(result);
      }
    });
  }

  /**
   * @description When a Place is dropped into the Open Spaces From the Timeline
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  placeDroppedinOpenSpace(placeDropped: Place) {
    if (placeDropped.dropped) {
      placeDropped.dropped = false;
      this.removePlaceFromTimeline(placeDropped);
      this.recalculateTimeLine();
    }
  }

  /**
   * @description When a Place is dropped into the Timeline from the Open Places
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  placeDroppedinTimeline(placeDropped: Place) {
    if (!placeDropped.dropped) {
      placeDropped.dropped = true;
      this.removePlaceFromOpen(placeDropped);
      if (this.timelinePlaces.length > 0) {
        this.getPlaceDistance(
          this.timelinePlaces[this.timelinePlaces.length - 1],
          placeDropped,
          true
        );
      } else {
        this.getPlaceDistance(this.timeline, placeDropped, true);
      }
    }
  }

  /**
   * @description Recalculate the Duration and distance between each of the Places of the Timeline
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  recalculateTimeLine() {
    if (this.timelinePlaces.length > 0) {
      this.timelinePlaces.forEach((place, index) => {
        if (index === 0) {
          this.getPlaceDistance(this.timeline, place, false);
        } else {
          this.getPlaceDistance(this.timelinePlaces[index - 1], place, false);
        }
      });
    }
  }

  /**
   * @description Remove a place from the Timeline
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  removePlaceFromTimeline(place: Place) {
    const placeIndex = this.timelinePlaces.indexOf(place);
    if (placeIndex > -1) {
      this.timelinePlaces.splice(placeIndex, 1);
    }
    this.insertNewPlace(place);
  }

  /**
   * @description Remove a Place from the Open Places
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  removePlaceFromOpen(place: Place) {
    const placeIndex = this.places.indexOf(place);
    if (placeIndex > -1) {
      this.places.splice(placeIndex, 1);
    }
  }

  /**
   * @description Here we set the distance and duration of a place between its
   *  previous place in the timeline, or the timeline start position if its
   * the first Place or if the Timeline is empty. And then we push it into
   * the Timeline if push is true
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  getPlaceDistance(
    place1:
      | Place
      | { geocodes: LatLngLiteral; startTime: string; endTime: string },
    place2: Place,
    push: boolean
  ) {
    const service = new google.maps.DistanceMatrixService();
    const source = new google.maps.LatLng(
      place1.geocodes.lat,
      place1.geocodes.lng
    );
    const destination = new google.maps.LatLng(
      place2.geocodes.lat,
      place2.geocodes.lng
    );
    const that = this;
    service.getDistanceMatrix(
      {
        origins: [source],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      },
      (response, status) => {
        if (
          status === google.maps.DistanceMatrixStatus.OK &&
          response.rows[0].elements[0].status !== ('ZERO_RESULTS' as any)
        ) {
          place2.distance = response.rows[0].elements[0].distance.value / 1000;
          place2.travelDuration = Math.floor(
            response.rows[0].elements[0].duration.value / 60
          );
          const previousTime =
            this.timelinePlaces.length === 0 ||
            this.timelinePlaces.indexOf(place2) === 0
              ? this.timeline.startTime
              : place1.endTime;
          place2.startTime = that.timeCalc.calculateTimeFromMinutes(
            this.timeCalc.calculateMinutesFromTime(previousTime) +
              place2.travelDuration
          );
          that.calculateEndTimeFromStartTime(place2);
          if (push) {
            this.timelinePlaces.push(place2);
          }
          this.analyseTimeline();
          this.getTimeLineWaypoints();
        } else {
          this.errorModalOpen('Unable to find the distance via road.');
        }
      }
    );
  }

  /**
   * @description Analyse If the Timeline has no conflicts like overflow
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  analyseTimeline() {
    console.log('analyseTimeline');
    const timelineduration =
      this.timeCalc.calculateMinutesFromTime(this.timeline.endTime) -
      this.timeCalc.calculateMinutesFromTime(this.timeline.startTime);
    let timelinePlacesDuration = 0;
    this.timelinePlaces.forEach(
      place => (timelinePlacesDuration += this.calculatePlaceDuration(place))
    );
    if (!(this.timeline.valid = timelineduration >= timelinePlacesDuration)) {
      this.openSnackBar('Oops! The Timeline cannot fit all the places');
    }
  }

  /**
   * @description Return the total duration (Travel and visit) of a Place
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculatePlaceDuration(place: Place) {
    return (
      place.travelDuration +
      this.timeCalc.calculateDuration(place.startTime, place.endTime)
    );
  }

  /**
   * @description Get the Timeline Waypoints excluding the Last (And the Timeline itself which is not included anyway)
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  getTimeLineWaypoints() {
    this.ngZone.run(() => {
      this.timeLineMarkers =
        this.timelinePlaces.length > 1
          ? this.timelinePlaces
              .map(timelinePlace => timelinePlace.geocodes)
              .slice(0, this.timelinePlaces.length - 1)
          : [];
    });
  }

  /**
   * @description Get the absolute position of the Travel Time of a Place in the Timeline
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculatePositionofTravelTime(place: Place): string {
    const duration = this.getTimeLineDuration();
    return (
      ((this.timeCalc.calculateMinutesFromTime(place.startTime) -
        place.travelDuration -
        this.timeCalc.calculateMinutesFromTime(this.timeline.startTime)) /
        duration) *
        100 +
      '%'
    );
  }

  /**
   * @description Get the absolute position of a Place in the Timeline
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculatePositionOfPlace(place: Place) {
    const duration = this.getTimeLineDuration();
    return (
      ((this.timeCalc.calculateMinutesFromTime(place.startTime) -
        this.timeCalc.calculateMinutesFromTime(this.timeline.startTime)) /
        duration) *
        100 +
      '%'
    );
  }

  /**
   * @description Get the width in percent to the timeline of a Place's Travel Time
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculateWidthofTravelTime(place: Place): string {
    return this.getWidthInTimeLine(place.travelDuration);
  }

  /**
   * @description Get the width in percent to the timeline of a Place (Currently fixed to 60 min)
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  calculateWidthofPlace(place: Place): string {
    return this.getWidthInTimeLine(
      this.timeCalc.calculateDuration(place.startTime, place.endTime)
    );
  }

  /**
   * @description Get the width in percent based on item duration and the timeline duration
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  getWidthInTimeLine(duration: number) {
    return (duration / this.getTimeLineDuration()) * 100 + '%';
  }

  /**
   * @description We can change the timeline dynamically if required.
   * In that case, we can calculate dynamically the duration of the timeline
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  getTimeLineDuration() {
    return this.timeCalc.calculateDuration(
      this.timeline.startTime,
      this.timeline.endTime
    );
  }

  /**
   * @description Show an Angular material SnackBar
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      verticalPosition: 'top',
      duration: 2000
    });
  }
}
