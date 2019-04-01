import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {
  constructor() {}

  readonly mapConstants = {
    lat: 51.274176,
    lng: 10.318448,
    zoom: 6
  };
}
