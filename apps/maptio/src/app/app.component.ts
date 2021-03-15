import { Component } from '@angular/core';

import data from './markhof.data.json';

@Component({
  selector: 'maptio-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'maptio';

  constructor() {
    console.log(data);
  }
}
