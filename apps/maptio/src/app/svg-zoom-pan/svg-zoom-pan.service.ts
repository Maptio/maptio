import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { InitiativeNode } from '../shared/initiative.model';


@Injectable({
  providedIn: 'root'
})
export class SvgZoomPanService {
  zoomedInitiativeNode = new Subject<InitiativeNode | undefined>();

  zoomToInitiativeNode(node: InitiativeNode | undefined) {
    this.zoomedInitiativeNode.next(node);
  }
}
