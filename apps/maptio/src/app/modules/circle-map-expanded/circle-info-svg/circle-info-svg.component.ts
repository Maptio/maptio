import { Component, Input, OnInit } from '@angular/core';

import { InitiativeNode, Helper, TagViewModel } from '../initiative.model';
import { HelperAvatarSvgComponent } from '../helper-avatar-svg/helper-avatar-svg.component';
import { TagSvgComponent } from '../tag-svg/tag-svg.component';


@Component({
    selector: 'g[maptioCircleInfoSvg]',
    templateUrl: './circle-info-svg.component.html',
    styleUrls: ['./circle-info-svg.component.scss'],
    imports: [TagSvgComponent, HelperAvatarSvgComponent]
})
export class CircleInfoSvgComponent implements OnInit {
  @Input() circle!: InitiativeNode;
  @Input() radius!: number;

  tags: TagViewModel[] = [];
  people: Helper[] = [];

  ngOnInit() {
    this.people = this.combineAllPeople();
    this.people = this.calculateAvatarPositions(this.people);
  }

  private combineAllPeople(): Helper[] {
    let people: Helper[] = [];

    if (this.circle.data.accountable) {
      people = [this.circle.data.accountable];
    }
    people = people.concat(this.circle.data.helpers);

    return people;
  }

  private calculateAvatarPositions(people: Helper[]) {
    people.forEach((person, index) => {
      person.position =
        'translate(' +
        (this.radius - 45) * Math.sin(0.2 * (index + 0.5 - people.length / 2)) +
        ',' +
        (this.radius - 45) * Math.cos(0.2 * (index + 0.5 - people.length / 2)) +
        ')';
    });

    return people;
  }
}
