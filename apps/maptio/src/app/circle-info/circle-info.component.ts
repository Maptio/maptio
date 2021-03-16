import { Component, Input } from '@angular/core';

import { Initiative } from '../shared/initiative.model';


@Component({
  selector: 'g[maptioCircleInfo]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle-info.component.html',
  styleUrls: ['./circle-info.component.scss']
})
export class CircleInfoComponent {
  @Input() circleInfo!: Initiative;
}
