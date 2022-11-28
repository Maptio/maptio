import { Component, Input, ElementRef, ViewChild, OnInit } from '@angular/core';

import { InitiativeNode, Helper } from '../initiative.model';

@Component({
  selector: 'g[maptioCircleInfoSvg]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle-info-svg.component.html',
  styleUrls: ['./circle-info-svg.component.scss'],
})
export class CircleInfoSvgComponent implements OnInit {
  @Input() circle!: InitiativeNode;
  @Input() radius!: number;

  @ViewChild('name') name?: ElementRef<SVGTextElement>;
  @ViewChild('namePath') namePath?: ElementRef<SVGPathElement>;

  people: Helper[] = [];

  // TODO: Move calculations into typescript code
  math = Math;

  ngOnInit() {
    this.people = this.combineAllPeople();
  }

  private combineAllPeople(): Helper[] {
    let people: Helper[] = [];

    if (this.circle.data.accountable) {
      people = [this.circle.data.accountable];
    }
    people = this.people.concat(this.circle.data.helpers);

    return people;
  }

  getTagPath() {
    const circleDiameter = 500;
    const distanceFromCircumference = -18;
    const pathDiameter = circleDiameter - distanceFromCircumference;

    let pathStartAngle;
    let pathEndAngle;

    if (this.name && this.namePath) {
      const nameLength = this.name.nativeElement.getComputedTextLength();

      // Also works, actually, only needs to be placed on the right path, duh!
      // const circumference = this.namePath.nativeElement.getTotalLength();

      const circumference = 2 * Math.PI * 500;

      console.log(this.circle.data.name);
      console.log(this.name);
      console.log(nameLength);
      console.log(this.namePath);
      console.log(circumference);
      console.log(this.namePath.nativeElement.getTotalLength());
      console.log((nameLength / circumference) * 360);

      pathStartAngle = ((nameLength / circumference) * 360) / 2 + 3;
      pathEndAngle = pathStartAngle + 10;

      console.log(`${pathStartAngle}, ${pathEndAngle}`);
    } else {
      pathStartAngle = 31; // degrees
      pathEndAngle = 43.5; // degrees
    }

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
