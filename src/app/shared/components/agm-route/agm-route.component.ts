import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges
} from '@angular/core';
import { GoogleMapsAPIWrapper, LatLngLiteral } from '@agm/core';
@Component({
  selector: 'app-agm-route',
  template: ''
})
export class AgmRouteComponent implements OnChanges, OnDestroy {
  @Input()
  origin: LatLngLiteral;
  @Input()
  destination: LatLngLiteral;
  @Input()
  waypoints: LatLngLiteral[];

  directionsDisplay: any;

  @Output() error = new EventEmitter<string>();

  constructor(private gmapsApi: GoogleMapsAPIWrapper) {}

  ngOnChanges() {
    this.plotRoute();
  }

  /**
   * @description First of all clear the previous and plot the currently supplied waypoints route.
   * We currently take the Travelmode as driving, however, many options can be configured as wanted.
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  plotRoute() {
    if (this.directionsDisplay !== undefined) {
      this.directionsDisplay.setMap(null);
    }
    const waypoints3: Waypoint[] = this.waypoints.map(
      (waypoint: LatLngLiteral) => ({
        location: waypoint.lat + ',' + waypoint.lng,
        stopover: true
      })
    );
    this.gmapsApi.getNativeMap().then(map => {
      this.directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#1e69ba' }
      });
      const directionsService = new google.maps.DirectionsService();
      const that = this;
      directionsService.route(
        {
          origin: { lat: this.origin.lat, lng: this.origin.lng },
          destination: {
            lat: this.destination.lat,
            lng: this.destination.lng
          },
          waypoints: waypoints3,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.directionsDisplay.setMap(map);
            that.directionsDisplay.setDirections(response);
          } else {
            that.error.emit('Could not Plot Route due to ' + status);
          }
        }
      );
    });
  }

  /**
   * @description Clear the route from the Map when this route is destroyed
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  ngOnDestroy() {
    this.directionsDisplay.setMap(null);
  }
}

export class Waypoint {
  location: string;
  stopover: boolean;
}
