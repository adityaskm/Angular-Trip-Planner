import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
  OnDestroy,
  Inject
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LatLngLiteral, MapsAPILoader } from '@agm/core';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Place } from '../../interfaces/interface';
declare var google: any;
@Component({
  selector: 'app-add-place',
  templateUrl: './add-place.component.html',
  styleUrls: ['./add-place.component.scss']
})
export class AddPlaceComponent implements OnInit, OnDestroy {
  @ViewChild('addressAutocomplete') addressAutocomplete: ElementRef;

  autocompleteGoogle = null;

  pageSubScriptions = new Subscription();

  placeForm = new FormGroup({
    name: new FormControl('', Validators.compose([Validators.required])),
    address: new FormControl('', Validators.compose([Validators.required])),
    startTime: new FormControl('', Validators.compose([Validators.required])),
    endTime: new FormControl('', Validators.compose([Validators.required]))
  });

  geocodeValid = false;

  geocodes: LatLngLiteral = {
    lat: 0,
    lng: 0
  };

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public dialogRef: MatDialogRef<AddPlaceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Place
  ) {}

  ngOnInit() {
    this.initializeAutocomplete();
  }

  /**
   * @description detect the Address Change in the form, clear the Geocode and initialize the autocomplete if not initialized
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  detectAddressChange() {
    this.pageSubScriptions.add(
      this.placeForm.controls.address.valueChanges.subscribe(data => {
        this.reinitializeGeocode();
        this.initializeAutocomplete();
      })
    );
  }

  /**
   * @description Reinitalize the Geocodes
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  reinitializeGeocode() {
    this.geocodes.lat = 0;
    this.geocodes.lng = 0;
    this.geocodeValid = false;
  }

  /**
   * @description Initialize the Google Places Autocomplete if not already done
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  initializeAutocomplete() {
    if (this.autocompleteGoogle == null) {
      const inputElement: HTMLInputElement = this.addressAutocomplete
        .nativeElement;
      this.mapsAPILoader.load().then(() => {
        this.autocompleteGoogle = new google.maps.places.Autocomplete(
          inputElement
        );
        this.autocompleteGoogle.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place: google.maps.places.PlaceResult = this.autocompleteGoogle.getPlace();
            this.placeForm.controls.address.setValue(
              this.addressAutocomplete.nativeElement.value
            );
            if (place.geometry === undefined || place.geometry === null) {
              console.error('geometry invalid');
              return;
            }
            this.geocodes.lat = place.geometry.location.lat();
            this.geocodes.lng = place.geometry.location.lng();
            this.geocodeValid = true;
          });
        });
      });
    }
  }

  cancelAndCloseModal() {
    this.dialogRef.close();
  }

  returnDialogData() {
    this.data = this.placeForm.value;
    this.data.geocodes = this.geocodes;
    return this.data;
  }

  /**
   * @description Clear all the subscriptions
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  ngOnDestroy() {
    this.pageSubScriptions.unsubscribe();
  }
}
