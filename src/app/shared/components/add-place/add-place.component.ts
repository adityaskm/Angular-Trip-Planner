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
    startTime: new FormControl(''),
    endTime: new FormControl('')
  });

  geocodeValid = false;

  geocodes: LatLngLiteral = {
    lat: 0,
    lng: 0
  };

  imgUrl = '/assets/images/draggable-place-24px.svg';

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
            console.log(place);
            console.log(
              place.photos[0].getUrl({ maxHeight: 100, maxWidth: 100 })
            );
            if (place.geometry === undefined || place.geometry === null) {
              console.error('geometry invalid');
              return;
            }
            this.setPlaceNameIfEmpty(place);
            this.imgUrl = place.photos[0].getUrl({
              maxHeight: 100,
              maxWidth: 100
            });
            this.geocodes.lat = place.geometry.location.lat();
            this.geocodes.lng = place.geometry.location.lng();
            this.geocodeValid = true;
          });
        });
      });
    }
  }

  /**
   * @description Here If the Place Name is Empty, we automatically set it from the google places result
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  setPlaceNameIfEmpty(place: google.maps.places.PlaceResult) {
    if (this.checkIfStringEmptyOrNull(this.placeForm.controls.name.value)) {
      this.placeForm.controls.name.setValue(place.name);
    }
  }

  cancelAndCloseModal() {
    this.dialogRef.close();
  }

  /**
   * @description Format the Place to be returned by filling the imageUrl (If it needs to be used), and the geocode
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  returnDialogData() {
    this.data = this.placeForm.value;
    this.data.geocodes = this.geocodes;
    this.data.imgUrl = this.imgUrl;
    return this.data;
  }

  /**
   * @description Function to check if a string is empty, null or undefined
   * @author Aditya Mudgerikar
   * @date 2019-04-01
   */
  checkIfStringEmptyOrNull(inputString: string) {
    return (
      inputString === undefined ||
      inputString === null ||
      (inputString + '').replace(/\s/g, '') === ''
    );
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
