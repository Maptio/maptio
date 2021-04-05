import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { InitiativeNode } from '../shared/initiative.model';


@Injectable({
  providedIn: 'root'
})
export class SvgZoomPanService {
  zoomedInitiativeNode = new Subject<InitiativeNode>();

  zoomToInitiativeNode(node: InitiativeNode) {
    this.zoomedInitiativeNode.next(node);
  }
}
