import { Component, Input, OnInit } from '@angular/core';

import { CircleMapService } from '../shared/circle-map.service';
import { InitiativeNode } from '../shared/initiative.model';


@Component({
  selector: 'g[maptioCircle]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss'],
})
export class CircleComponent implements OnInit {
  @Input() circle!: InitiativeNode;

  centerX = 500;
  centerY = 500;
  defaultRadius = 500;

  parentX = 0;
  parentY = 0;
  parentRadius = 0;
  x = 0;
  y = 0;
  radius = 0;
  diameter = 0;
  scale = 1;
  infoX = 0;
  infoY = 0;
  infoSize = 0;
  transformOrigin = '0 0';

  // TODO: Move calculations into typescript code
  math = Math;

  constructor(private circleMapService: CircleMapService) {}

  ngOnInit() {
    this.radius = this.circle.r;
    this.diameter = this.radius * 2;
    this.scale = this.diameter / 1000;

    if (this.circle.data.isPrimary) {
      this.parentX = this.centerX;
      this.parentY = this.centerY;
      this.parentRadius = this.defaultRadius;

      this.x = this.circle.x / 10;
      this.y = this.circle.y / 10;

      this.scale = this.radius / this.parentRadius;

      this.transformOrigin = '0 0';
    } else if (this.circle.parent && this.circle.parent.parent) {
      // This achieves the correct size (322) if no translate applied
      // and if a translate of (-100 and -100) is artificially applied for testing!
      // So this scaling factor works!
      this.scale = this.circle.r / this.circle.parent.r;
      // const parentScale = this.circle.parent.r / this.circle.parent.parent.r;
      const parentScale = this.circle.parent.r / 500;

      this.transformOrigin = '0 0';

      this.x = (this.circle.x - this.circle.parent.x) / 10 / parentScale;
      this.y = (this.circle.y - this.circle.parent.y) / 10 / parentScale;

      // this.parentX = this.circle.parent.x;
      // this.parentY = this.circle.parent.y;
      // this.x = this.circle.x - this.circle.parent.x;
      // this.y = this.circle.y - this.circle.parent.y;
      // this.scale = this.circle.r / this.defaultRadius;
      // this.scale = 0.9;
    } else {
      console.error('It should be impossible for a circle that is not a primary circle to not have a parent!');
    }

    this.infoSize = this.defaultRadius * 2 / Math.sqrt(2);
    this.infoX = -this.defaultRadius / Math.sqrt(2);
    this.infoY = -this.defaultRadius / Math.sqrt(2);
  }

  onClick($event: MouseEvent) {
    console.log(`CircleComponent.onClick fired for: ${this.circle.data.name}`);

    this.circleMapService.onCircleClick(this.circle);

    // Avoid triggering click events for circles underneath this one
    $event.stopPropagation();
  }
}
