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
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.getMapData();
  }

  getMapData() {
    this.dataService.getMapData().subscribe(data => {
      if (data.hasError === false) {
        this.places = data.data;
      }
    });
  }

  insertNewPlace(place: Place) {
    const placeError = this.analyseIfPlaceExists(place);
    placeError === ''
      ? this.places.push(place)
      : this.errorModalOpen(placeError);
  }

  errorModalOpen(errorMsg: string) {
    this.dialog.open(ErrorModalComponent, {
      width: '60%',
      data: errorMsg
    });
  }

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

  insertPlaceInTimeline(place: Place) {
    if (this.timelinePlaces.indexOf(place) === -1) {
      this.timelinePlaces.push(place);
    }
  }

  sortPlacesInTimeline() {
    this.timelinePlaces.sort(
      (a, b) =>
        this.timeCalc.calculateMinutesFromTime(a.startTime) -
        this.timeCalc.calculateMinutesFromTime(b.startTime)
    );
  }

  calculateEndTimeFromStartTime(place: Place) {
    place.endTime = this.timeCalc.calculateTimeFromMinutes(
      this.timeCalc.calculateMinutesFromTime(place.startTime) + 60
    );
  }

  openPlaceModal() {
    const dialogRef = this.dialog.open(AddPlaceComponent, {
      data: new Place(this.constants)
    });

    dialogRef.afterClosed().subscribe((result: Place) => {
      this.insertNewPlace(result);
    });
  }

  placeDroppedinOpenSpace(placeDropped: Place) {
    if (placeDropped.dropped) {
      placeDropped.dropped = false;
      this.removePlaceFromTimeline(placeDropped);
    }
  }

  placeDroppedinTimeline(placeDropped: Place) {
    if (!placeDropped.dropped) {
      placeDropped.dropped = true;
      this.removePlaceFromOpen(placeDropped);
      if (this.timelinePlaces.length > 0) {
        this.getPlaceDistance(
          this.timelinePlaces[this.timelinePlaces.length - 1],
          placeDropped
        );
      } else {
        this.getPlaceDistance(this.timeline, placeDropped);
      }
    }
  }

  removePlaceFromTimeline(place: Place) {
    const placeIndex = this.timelinePlaces.indexOf(place);
    if (placeIndex > -1) {
      this.timelinePlaces.splice(placeIndex, 1);
    }
    this.insertNewPlace(place);
  }

  removePlaceFromOpen(place: Place) {
    const placeIndex = this.places.indexOf(place);
    if (placeIndex > -1) {
      this.places.splice(placeIndex, 1);
    }
  }

  getPlaceDistance(
    place1:
      | Place
      | { geocodes: LatLngLiteral; startTime: string; endTime: string },
    place2: Place
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
            this.timelinePlaces.length > 0
              ? place1.endTime
              : this.timeline.startTime;
          place2.startTime = that.timeCalc.calculateTimeFromMinutes(
            this.timeCalc.calculateMinutesFromTime(previousTime) +
              place2.travelDuration
          );
          that.calculateEndTimeFromStartTime(place2);
          this.timelinePlaces.push(place2);
          this.analyseTimeline();
          this.getTimeLineWaypoints();
        } else {
          this.errorModalOpen('Unable to find the distance via road.');
        }
      }
    );
  }

  analyseTimeline() {
    const timelineduration =
      this.timeCalc.calculateMinutesFromTime(this.timeline.endTime) -
      this.timeCalc.calculateMinutesFromTime(this.timeline.startTime);
    let timelinePlacesDuration = 0;
    this.timelinePlaces.forEach(
      place => (timelinePlacesDuration += this.calculatePlaceDuration(place))
    );
    this.timeline.valid = timelineduration >= timelinePlacesDuration;
  }

  calculatePlaceDuration(place: Place) {
    return (
      place.travelDuration +
      this.timeCalc.calculateDuration(place.startTime, place.endTime)
    );
  }

  getTimeLineWaypoints() {
    this.ngZone.run(() => {
      this.timeLineMarkers =
        this.timelinePlaces.length > 1
          ? this.timelinePlaces
              .map(timelinePlace => timelinePlace.geocodes)
              .slice(1, this.timelinePlaces.length - 2)
          : [];
    });
  }

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

  calculateWidthofTravelTime(place: Place): string {
    return this.getWidthInTimeLine(place.travelDuration);
  }

  calculateWidthofPlace(place: Place): string {
    return this.getWidthInTimeLine(
      this.timeCalc.calculateDuration(place.startTime, place.endTime)
    );
  }

  getWidthInTimeLine(duration: number) {
    return (duration / this.getTimeLineDuration()) * 100 + '%';
  }

  getTimeLineDuration() {
    return this.timeCalc.calculateDuration(
      this.timeline.startTime,
      this.timeline.endTime
    );
  }
}
