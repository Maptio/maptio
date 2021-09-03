import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { InitiativeNode } from '../initiative.model';


@Injectable({
  providedIn: 'root'
})
export class SvgZoomPanService {
  zoomedInitiativeNode = new BehaviorSubject<InitiativeNode | undefined>(undefined);
  zoomScaleFactor = new BehaviorSubject<number | undefined>(undefined);
  isClickFromPanning = false;

  zoomToInitiativeNode(node: InitiativeNode | undefined) {
    this.zoomedInitiativeNode.next(node);
  }

  zoomByScaleFactor(scaleFactor: number) {
    this.zoomScaleFactor.next(scaleFactor);
  }
}
