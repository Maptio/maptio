import { Component, Input, OnInit } from '@angular/core';

import { HierarchyCircularNode } from 'd3-hierarchy';

import { Initiative } from '../shared/initiative.model';

@Component({
  selector: 'g[maptioCircle]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss']
})
export class CircleComponent implements OnInit {
  @Input() circle!: HierarchyCircularNode<Initiative>;
  @Input() selected = false;

  // TODO: Move calculations into typescript code
  math = Math;

  ngOnInit(): void {
    console.log('remove me');
  }
}
