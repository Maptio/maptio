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

  x = 0;
  y = 0;
  diameter = 0;

  // TODO: Move calculations into typescript code
  math = Math;

  constructor(private circleMapService: CircleMapService) {}

  ngOnInit() {
    this.x = this.circle.x - this.circle.r / Math.sqrt(2)
    this.y = this.circle.y - this.circle.r / Math.sqrt(2)
    this.diameter = this.circle.r * 2 / Math.sqrt(2);
  }

  onClick($event: MouseEvent) {
    console.log(`CircleComponent.onClick fired for: ${this.circle.data.name}`);

    this.circleMapService.onCircleClick(this.circle);

    // Avoid triggering click events for circles underneath this one
    $event.stopPropagation();
  }
}
