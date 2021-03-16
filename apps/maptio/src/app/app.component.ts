import { Component } from '@angular/core';

import { hierarchy, pack, HierarchyCircularNode } from 'd3-hierarchy';

import data from './markhof.data.json';

interface Initiative {
  name: string;
  colour: string;
}

@Component({
  selector: 'maptio-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'maptio';
  circles: HierarchyCircularNode<Initiative>[];
  math = Math;

  constructor() {
    console.log(data);
    console.log(pack);

    const diameter = 1000;
    const margin = 15;
    const PADDING_CIRCLE = 20;

    const boo = pack<Initiative>()
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
      })
      .sort(function (a, b) {
        if (a && a.value && b && b.value) {
          return b.value - a.value;
        } else {
          return 0;
        }
      });

    console.log('data after running hierarchy:');
    console.log(root);

    console.log('data after running circle packing:');
    this.circles = boo(root).descendants();
    console.log(this.circles);
  }
}
