import { Component } from '@angular/core';

import { hierarchy, pack } from 'd3-hierarchy';

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
    console.log(pack);

    const diameter = 1000;
    const margin = 15;
    const PADDING_CIRCLE = 20;

    const boo = pack()
      .size([diameter - margin, diameter - margin])
      .padding(function () { // eslint-disable-line @typescript-eslint/no-explicit-any
        return PADDING_CIRCLE;
      });

    console.log('data before running hierarchy:');
    console.log(data);
      
    const root: any = hierarchy(data) // eslint-disable-line @typescript-eslint/no-explicit-any
    .sum(function (d) {
      return (Object.prototype.hasOwnProperty.call(d, 'accountable')? 1 : 0) +
        (Object.prototype.hasOwnProperty.call(d, 'helpers') ? d.helpers.length : 0) + 1;
    });
    // .sort(function (a, b) {
    //   return b.value - a.value;
    // });

    console.log('data after running hierarchy:');
    console.log(root);

    console.log('data after running circle packing:');
    console.log(boo(root).descendants());
  }
}
