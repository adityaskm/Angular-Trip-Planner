import { LatLngLiteral } from '@agm/core';
import { ConstantsService } from '../services/constants.service';

export interface GeneralResponseObject {
  hasError: boolean;
  error: string;
}

export interface MapDataResponse extends GeneralResponseObject {
  data: Place[];
}
export interface Place {
  name: string;
  address: string;
  geocodes: LatLngLiteral;
  startTime: string;
  endTime: string;
  travelDuration: number;
  distance: number;
  dropped: boolean;
  imgUrl: string;
}

export class Place {
  constructor(private constants: ConstantsService) {}
  name = '';
  address = '';
  geocodes = {
    lat: this.constants.mapConstants.lat,
    lng: this.constants.mapConstants.lng
  };
  startTime = '';
  endTime = '';
  travelDuration = 0;
  distance = 0;
  dropped = false;
  imgUrl = '';
}
