import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { InitiativeNode } from '../initiative.model';
import { HelperAvatarComponent } from '../helper-avatar/helper-avatar.component';


@Component({
    selector: 'g[maptioCircleInfo]',
    templateUrl: './circle-info.component.html',
    styleUrls: ['./circle-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [HelperAvatarComponent]
})
export class CircleInfoComponent implements OnInit {
  @Input() circle!: InitiativeNode;

  fontSizeInitial = 56;
  fontSizeUnit = 'px'; // Using pixels rather than rem leads to better rendering at small sizes
  fontSizeScalingFactor = 4;
  fontSize: string;

  constructor() {
    this.fontSize = this.fontSizeInitial + this.fontSizeUnit;
  }

  ngOnInit(): void {
    this.fontSize = this.fontSizeInitial + this.fontSizeUnit;
  }

  onDetailsButtonClick($event: MouseEvent) {
    console.log('boo');
    // Avoid triggering click events for the circle when a tag avatar is clicked
    $event.stopPropagation();
  }

  onTagClick($event: MouseEvent) {
    // Avoid triggering click events for the circle when a tag avatar is clicked
    $event.stopPropagation();
  }
}
