import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapDataResponse } from '../interfaces/interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  getMapData() {
    return this.http.get<MapDataResponse>('/assets/mock-jsons/places.json');
  }
}
