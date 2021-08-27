import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { InitiativeNode } from '../initiative.model';


@Injectable({
  providedIn: 'root'
})
export class SvgZoomPanService {
  zoomedInitiativeNode = new BehaviorSubject<InitiativeNode | undefined>(undefined);
  hasPanningJustStopped = false;

  zoomToInitiativeNode(node: InitiativeNode | undefined) {
    this.zoomedInitiativeNode.next(node);
  }
}
