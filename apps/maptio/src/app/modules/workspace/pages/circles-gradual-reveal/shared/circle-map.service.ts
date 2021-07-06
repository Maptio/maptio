import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { InitiativeNode } from './initiative.model';
import { SvgZoomPanService } from '../svg-zoom-pan/svg-zoom-pan.service';

@Injectable({
  providedIn: 'root'
})
export class CircleMapService {
  public selectedCircle = new BehaviorSubject<InitiativeNode | undefined>(undefined);
  public openedCircle = new BehaviorSubject<InitiativeNode | undefined>(undefined);

  constructor(
    private svgZoomPanService: SvgZoomPanService,
  ) {}

  onCircleClick(circle: InitiativeNode) {
    const isSelected = this.selectedCircle.value ? circle.data.id === this.selectedCircle.value.data.id : false;
    const isOpened = circle.data.isOpened;
    const isPrimary = circle.data.isPrimary;
    const isLeaf = circle.data.isLeaf;

    if (isLeaf && isSelected) {
      this.selectAndZoomToParentOfSelectedCircle();
    } else if (isPrimary && !isOpened) {
      this.selectCircle(circle);
      this.zoomToCircle(circle);

      if (this.openedCircle.value) {
        this.closeCircle(this.openedCircle.value);
      }

      if (!isLeaf) {
        this.openCircle(circle);
      }
    } else if (isSelected && !isOpened) {
      // If a selected circle is clicked when the info is shown, open the circle to show its children
      this.openCircle(circle);
    } else if (isSelected && isOpened) {
      // Close selected circle if it's curently open
      this.closeCircle(circle);
    } else {
      // If a circle is not selected
      this.selectCircle(circle);
      this.zoomToCircle(circle);

      if (circle.parent) {
        this.closeCircle(circle.parent);
      }
    }
  }

  onBackdropClick() {
    this.selectAndZoomToParentOfSelectedCircle();
  }

  selectCircle(circle: InitiativeNode) {
    this.deselectSelectedCircle();
    this.markCircleAsSelected(circle);
    this.rememberSelectedCircle(circle);

    this.selectedCircle.next(circle);
  }

  deselectSelectedCircle() {
    if (this.selectedCircle.value) {
      this.markCircleAsNotSelected(this.selectedCircle.value);
    }
    this.selectedCircle.next(undefined);
  }

  markCircleAsSelected(circle: InitiativeNode) {
    circle.data.isSelected = true;
  }

  markCircleAsNotSelected(circle: InitiativeNode) {
    circle.data.isSelected = false;
    this.openedCircle.next(circle);
  }

  rememberSelectedCircle(circle: InitiativeNode) {
    localStorage.setItem('node_id', circle.data.id.toString());
  }

  getLastSelectedCircle(circles: InitiativeNode[]) {
    const lastSelectedCircleIdString = localStorage.getItem('node_id');
    const lastSelectedCircleId = lastSelectedCircleIdString ? parseInt(lastSelectedCircleIdString) : lastSelectedCircleIdString;
    const lastSelectedCircle = circles.find((circle) => circle.data.id === lastSelectedCircleId);
    this.selectedCircle.next(lastSelectedCircle);
    return lastSelectedCircle;
  }

  openCircle(circle: InitiativeNode) {
    this.markCircleAsOpened(circle);
  }

  closeCircle(circle: InitiativeNode) {
    this.markCircleAsClosed(circle);
    this.openedCircle.next(undefined);
  }

  markCircleAsOpened(circle: InitiativeNode) {
    circle.data.isOpened = true;
  }

  markCircleAsClosed(circle: InitiativeNode) {
    circle.data.isOpened = false;
  }

  zoomToCircle(circle?: InitiativeNode) {
    this.svgZoomPanService.zoomToInitiativeNode(circle);
  }

  resetZoom() {
    this.svgZoomPanService.zoomToInitiativeNode(undefined);
  }

  selectAndZoomToParentOfSelectedCircle() {
    const parentCircle = this.selectedCircle.value?.parent;

    if (this.selectedCircle.value && this.selectedCircle.value.data.isOpened) {
      this.closeCircle(this.selectedCircle.value);
    } else if (parentCircle && parentCircle.parent) {
      this.selectCircle(parentCircle);
      this.zoomToCircle(parentCircle);
      this.openCircle(parentCircle);
    } else {
      this.deselectSelectedCircle();
      this.zoomToCircle(undefined);
    }
  }
}
