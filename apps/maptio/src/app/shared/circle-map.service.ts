import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { HierarchyCircularNode } from 'd3-hierarchy';

import { Initiative } from './initiative.model';


@Injectable({
  providedIn: 'root'
})
export class CircleMapService {
  public selectedCircle = new BehaviorSubject<HierarchyCircularNode<Initiative> | undefined>(undefined);

  selectCircle(circle: HierarchyCircularNode<Initiative>) {
    console.log('Selecting circle from service');
    console.log(circle);
    this.selectedCircle.next(circle);
  }
}
