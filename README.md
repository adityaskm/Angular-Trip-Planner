# maps

This Project is a demo for A manual Trip Planning Solution.
Demo: http://angular.inkpixels.in/

You can Drag and Drop Placews from the Left (The Open Places View) Onto the Timeline. The App Calculates the distance between the Person (Set to munich) or the previous Place and the Newly Added Place.
This app is sectioned into a main page: The maps component, and a shared folder containing the rest of the components, directives, interfaces, pipes and services.

## How to Use

Drag a place From the Left (The Open Places View) Onto the Timeline. Create a new Place by clicking on the + button on the top right of the open places View. You can enter the place name or just the place Address (The System Generates the name Automatically). The Address needs to be choosen from the Google Places Autocomplete results.
You can Drag and Drop the Places back to the open places View.
The System Calculates whether the timeline is valid (against overflow of Places).

## Features

1. Google Places Autocomplete and places Image Integration.
2. Custom Component for Directions Display.
3. Distance matrix API Integration.
4. Drag and Drop Events which work in Mobile and Desktop

## Libraries Used:

1. Materialize CSS: `angular2-materialize` (https://www.npmjs.com/package/angular2-materialize)
2. Angular Material
3. Ng-Drag-Drop `ng-drag-drop` (https://www.npmjs.com/package/ng-drag-drop)
4. Angular Google Maps `@agm/core` (https://angular-maps.com)
5. HTML 5 Drag Drop Touch Polyfill (For Touch Events on Mobile Devices) (https://github.com/Bernardo-Castilho/dragdroptouch)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
