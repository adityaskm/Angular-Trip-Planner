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
  origin;
  @Input()
  destination;
  @Input()
  waypoints;

  directionsDisplay: any;

  @Output() error = new EventEmitter<string>();

  constructor(private gmapsApi: GoogleMapsAPIWrapper) {}

  ngOnChanges() {
    this.plotRoute();
  }

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
        // preserveViewport: true,
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

  ngOnDestroy() {
    this.directionsDisplay.setMap(null);
  }
}

export class Waypoint {
  location: string;
  stopover: boolean;
}
