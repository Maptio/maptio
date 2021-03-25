import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { HierarchyCircularNode } from 'd3-hierarchy';
import { CircleMapService } from '../shared/circle-map.service';

import { Initiative } from '../shared/initiative.model';

@Component({
  selector: 'g[maptioCircle]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CircleComponent implements OnInit {
  @Input() circle!: HierarchyCircularNode<Initiative>;

  // TODO: Move calculations into typescript code
  math = Math;

  constructor(private circleMapService: CircleMapService) {}

  ngOnInit(): void {
    console.log('remove me');
  }

  selectCircle() {
    this.circle.data.isSelected = true;
    this.circleMapService.selectCircle(this.circle);
  }

  onClick($event: MouseEvent) {
    console.log(`onClick from: ${this.circle.data.name}`);
    this.selectCircle();
    $event.stopPropagation();
  }
}
