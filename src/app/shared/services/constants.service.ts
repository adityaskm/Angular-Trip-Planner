import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {
  constructor() {}

  readonly mapConstants = {
    lat: 48.1351253,
    lng: 11.581980499999986,
    zoom: 12
  };

  timeFrameInterval = 60;
  placeDefaultDuration = 60;
}
