import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { SatPopover } from '@ncstate/sat-popover';

import { CircleMapService } from '../circle-map.service';
import { InitiativeNode, Helper } from '../initiative.model';

@Component({
  selector: 'g[maptioCircle]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss'],
})
export class CircleComponent implements OnInit {
  @Input() circle!: InitiativeNode;

  @ViewChild('popover') popover?: SatPopover;

  people: Helper[] = [];

  defaultRadius = 500;

  x = 0;
  y = 0;
  scale = 1;

  infoX = 0;
  infoY = 0;
  infoSize = 0;

  isPopoverHidden = true;

  // TODO: Move calculations into typescript code
  math = Math;

  constructor(private circleMapService: CircleMapService) {}

  ngOnInit() {
    if (this.circle.data.isPrimary) {
      this.x = this.circle.x / 10;
      this.y = this.circle.y / 10;
      this.scale = this.circle.r / this.defaultRadius;
    } else if (this.circle.parent) {
      const parentScale = this.circle.parent.r / this.defaultRadius;
      this.x = (this.circle.x - this.circle.parent.x) / 10 / parentScale;
      this.y = (this.circle.y - this.circle.parent.y) / 10 / parentScale;
      this.scale = this.circle.r / this.circle.parent.r;
    } else {
      console.error(
        'It should be impossible for a circle that is not a primary circle to not have a parent!'
      );
    }

    this.infoSize = (this.defaultRadius * 2) / Math.sqrt(2);
    this.infoX = -this.defaultRadius / Math.sqrt(2);
    this.infoY = -this.defaultRadius / Math.sqrt(2);

    this.people = [this.circle.data.accountable].concat(
      this.circle.data.helpers
    );
  }

  onClick($event: MouseEvent) {
    this.circleMapService.onCircleClick(this.circle);

    // Prevent popover from staying open even after a circle was clicked
    this.popover?.close();

    // Avoid triggering click events for circles underneath this one
    $event.stopPropagation();
  }

  /**
   * Close popover when circle is opened or is large enough
   */
  onPopoverOpen() {
    const isReadable = this.scale > 0.25;
    const isSelectedOrOpened =
      this.circle.data.isOpened ||
      (this.circle.data.isSelected && !this.circle.data.isPrimary); // Primary circles always start selected

    if (isReadable || isSelectedOrOpened) {
      this.popover?.close();
      this.isPopoverHidden = true;
    } else {
      this.isPopoverHidden = false;
    }
  }

  onPopoverClose() {
    this.isPopoverHidden = true;
  }

  getTagPath() {
    const circleDiameter = 500;
    const distanceFromCircumference = 22;
    const pathDiameter = circleDiameter - distanceFromCircumference;

    const pathStartAngle = 31; // degrees
    const pathEndAngle = 43.5; // degrees

    const pathStartingPoint = `M ${this.getPointString(
      pathStartAngle,
      pathDiameter
    )}`;

    const pathEndPointString = this.getPointString(pathEndAngle, pathDiameter);
    const pathArc = `A ${pathDiameter},${pathDiameter} 0 0 1 ${pathEndPointString}`;

    const path = `${pathStartingPoint} ${pathArc}`;

    return path;
  }

  private getPointString(angleInDegrees, diameter) {
    const x = this.getX(angleInDegrees, diameter);
    const y = this.getY(angleInDegrees, diameter);

    return `${x},${y}`;
  }

  private getX(angleInDegrees, diameter) {
    return diameter * Math.sin((angleInDegrees / 360) * 2 * Math.PI);
  }

  private getY(angleInDegrees, diameter) {
    return -1 * diameter * Math.cos((angleInDegrees / 360) * 2 * Math.PI);
  }
}
