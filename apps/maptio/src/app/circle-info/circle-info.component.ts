import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { InitiativeNode } from '../shared/initiative.model';


@Component({
  selector: 'g[maptioCircleInfo]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle-info.component.html',
  styleUrls: ['./circle-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CircleInfoComponent implements OnInit {
  @Input() circle!: InitiativeNode;

  fontSizeInitial = 4.5;
  fontSizeUnit = 'rem';
  fontSizeScalingFactor = 4;
  fontSize: string;

  constructor() {
    this.fontSize = this.fontSizeInitial + this.fontSizeUnit;
  }

  ngOnInit(): void {
    this.fontSize = this.fontSizeInitial * this.circle.r / 500 + this.fontSizeUnit;
  }
}
