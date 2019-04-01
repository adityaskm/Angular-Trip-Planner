import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MapsComponent } from './pages/maps/maps.component';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { NgDragDropModule } from 'ng-drag-drop';
import { AddPlaceComponent } from './shared/components/add-place/add-place.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { ErrorModalComponent } from './shared/components/error-modal/error-modal.component';
import { AgmDirectionModule } from 'agm-direction';
import { AgmRouteComponent } from './shared/components/agm-route/agm-route.component';
import { TimeframeComponent } from './shared/components/timeframe/timeframe.component';
import { DistanceFormatterPipe } from './shared/pipes/distance-formatter.pipe';
import { DurationFormatterPipe } from './shared/pipes/duration-formatter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MapsComponent,
    AddPlaceComponent,
    ErrorModalComponent,
    AgmRouteComponent,
    TimeframeComponent,
    DistanceFormatterPipe,
    DurationFormatterPipe,
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsAPIKey
    }),
    AgmDirectionModule,
    HttpClientModule,
    NgDragDropModule.forRoot(),
    ReactiveFormsModule,
    MatDialogModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AddPlaceComponent, ErrorModalComponent]
})
export class AppModule {}
