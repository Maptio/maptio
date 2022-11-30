import {
  Component,
  Input,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  OnInit,
  AfterViewInit,
} from '@angular/core';

import { InitiativeNode, Helper, TagViewModel } from '../initiative.model';

@Component({
  selector: 'g[maptioCircleInfoSvg]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle-info-svg.component.html',
  styleUrls: ['./circle-info-svg.component.scss'],
})
export class CircleInfoSvgComponent implements OnInit, AfterViewInit {
  @Input() circle!: InitiativeNode;
  @Input() radius!: number;

  @ViewChild('name') name?: ElementRef<SVGTextElement>;
  @ViewChild('namePath') namePath?: ElementRef<SVGPathElement>;
  @ViewChildren('tagText') tagTexts?: QueryList<ElementRef<SVGTextElement>>;

  tags: TagViewModel[] = [];
  people: Helper[] = [];

  // TODO: Move calculations into typescript code
  math = Math;

  ngOnInit() {
    this.people = this.combineAllPeople();

    const circleEdgePathFromPointAtBottom = `M 0,500 A 500,500 0 0 1 500,0 A 500,500 0 0 1 0,500`;

    const nameLength = this.name?.nativeElement?.getComputedTextLength();
    console.log('name length in ngOnInit():', nameLength);

    this.tags = this.circle.data.tags.map((tagData, index) => {
      const pathStartAngle = 45 + 40 * index;
      const pathEndAngle = pathStartAngle + 30;
      const path = this.getCirclePath(pathStartAngle, pathEndAngle);

      const tag: TagViewModel = {
        name: tagData.name,
        color: tagData.color,
        textStartOffset: 0,
        pathId: `tagPath-circle-${this.circle.data.id}-tag-${index}`,
        pathStartAngle,
        pathEndAngle,
        path,
      };

      return tag;
    });

    // if (this.tags.length > 1) {
    //   this.tags = [this.tags[0]];
    // }
  }

  ngAfterViewInit() {
    const nameLength = this.name?.nativeElement?.getComputedTextLength();
    console.log('name length in ngAfterViewInit():', nameLength);
    this.calculateTagPositions();
  }

  private combineAllPeople(): Helper[] {
    let people: Helper[] = [];

    if (this.circle.data.accountable) {
      people = [this.circle.data.accountable];
    }
    people = people.concat(this.circle.data.helpers);

    return people;
  }

  private calculateTagPositions() {
    const angularTagSpacing = 8; // degrees

    let firstTagStartAngle; // degrees

    let circumference;
    if (this.name && this.namePath) {
      const nameLength = this.name.nativeElement.getComputedTextLength();
      circumference = this.namePath.nativeElement.getTotalLength();

      firstTagStartAngle =
        ((nameLength / circumference) * 360) / 2 + angularTagSpacing;
    } else {
      throw Error(
        'Tag positions are being calculated before the necessary information is available!'
      );
    }

    let pathStartAngle = firstTagStartAngle;
    const angularWidthOfLastTag = 20;

    // for (let i = 0; i < this.tags.length; i++) {
    //   const tag = this.tags[i];
    //   const tagTextElement = j;
    // }

    this.tagTexts.forEach((tagTextElement, index) => {
      const textLength = tagTextElement.nativeElement.getComputedTextLength();
      const angularWidth = (textLength / circumference) * 360 + 1;
      // console.log(textLength);

      // TODO Guard the shit out of this...?
      const tag = this.tags[index];

      tag.path = this.getCirclePath(
        pathStartAngle,
        pathStartAngle + angularWidth
      );

      pathStartAngle += angularWidth + angularTagSpacing;
    });

    // this.tags.forEach((tag, index) => {
    //   tag.path = this.getCirclePath(
    //     pathStartAngle,
    //     pathStartAngle + angularWidthOfLastTag
    //   );

    //   // if (
    //   //   index >= this.tagTexts.length &&
    //   //   this.tagTexts[index] &&
    //   //   this.tagTexts[index].nativeElement
    //   // ) {
    //   //   console.log(this.tagTexts[index].nativeElement.getComputedTextLength());
    //   // } else {
    //   //   console.log(index);
    //   //   console.log(this.tagTexts);
    //   //   console.log(this.tagTexts[index]);
    //   //   console.log(this.tagTexts[index].nativeElement);
    //   //   throw Error('Unable to read tag lengths');
    //   // }

    //   pathStartAngle += angularWidthOfLastTag + angularTagSpacing;
    // });

    // this.tags = this.circle.data.tags.map((tagData, index) => {
    //   const pathStartAngle = 45 + 40 * index;
    //   const pathEndAngle = pathStartAngle + 30;
    //   const path = this.getCirclePath(pathStartAngle, pathEndAngle);

    //   const tag: TagViewModel = {
    //     name: tagData.name,
    //     color: tagData.color,
    //     textStartOffset: 0,
    //     pathId: `tagPath-${index}`,
    //     pathStartAngle,
    //     pathEndAngle,
    //     path,
    //   };

    //   return tag;
    // });

    // pathEndAngle = first + 12.5;

    // const pathStartingPoint = `M ${this.getPointString(
    //   pathStartAngle,
    //   pathDiameter
    // )}`;

    // const pathEndPointString = this.getPointString(pathEndAngle, pathDiameter);
    // const pathArc = `A ${pathDiameter},${pathDiameter} 0 0 1 ${pathEndPointString}`;

    // const path = `${pathStartingPoint} ${pathArc}`;

    // return path;
  }

  getCirclePath(pathStartAngle, pathEndAngle) {
    const circleDiameter = 500;
    const distanceFromCircumference = 26;
    const pathDiameter = circleDiameter - distanceFromCircumference;

    const pathStartingPoint = `M ${this.getPointString(
      pathStartAngle,
      pathDiameter
    )}`;

    const pathEndPointString = this.getPointString(pathEndAngle, pathDiameter);
    const pathArc = `A ${pathDiameter},${pathDiameter} 0 0 1 ${pathEndPointString}`;

    const path = `${pathStartingPoint} ${pathArc}`;

    return path;
  }

  getTagPath(pathStartAngle, pathEndAngle) {
    const circleDiameter = 500;
    const distanceFromCircumference = 26;
    const pathDiameter = circleDiameter - distanceFromCircumference;

    if (this.name && this.namePath) {
      const nameLength = this.name.nativeElement.getComputedTextLength();

      // Also works, actually, only needs to be placed on the right path, duh!
      // const circumference = this.namePath.nativeElement.getTotalLength();

      const circumference = 2 * Math.PI * 500;

      // console.log(this.circle.data.name);
      // console.log(this.name);
      // console.log(nameLength);
      // console.log(this.namePath);
      // console.log(circumference);
      // console.log(this.namePath.nativeElement.getTotalLength());
      // console.log((nameLength / circumference) * 360);

      pathStartAngle = ((nameLength / circumference) * 360) / 2 + 5;
      pathEndAngle = pathStartAngle + 12.5;

      // console.log(`${pathStartAngle}, ${pathEndAngle}`);
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
