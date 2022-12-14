import { Component, Input, OnInit } from '@angular/core';

import { InitiativeNode, Helper, TagViewModel } from '../initiative.model';

@Component({
  selector: 'g[maptioCircleInfoSvg]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './circle-info-svg.component.html',
  styleUrls: ['./circle-info-svg.component.scss'],
})
export class CircleInfoSvgComponent implements OnInit {
  @Input() circle!: InitiativeNode;
  @Input() radius!: number;

  tags: TagViewModel[] = [];
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
    people = people.concat(this.circle.data.helpers);

    return people;
  }
}