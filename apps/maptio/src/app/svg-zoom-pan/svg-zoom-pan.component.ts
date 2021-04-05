import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { SubSink } from 'subsink';

import { SvgZoomPanService } from './svg-zoom-pan.service';
import { InitiativeNode } from '../shared/initiative.model';


@Component({
  selector: 'maptio-svg-zoom-pan',
  templateUrl: './svg-zoom-pan.component.html',
  styleUrls: ['./svg-zoom-pan.component.scss']
})
export class SvgZoomPanComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  constructor(private svgZoomPanService: SvgZoomPanService) {}

  ngOnInit() {
    this.subs.sink = this.svgZoomPanService.zoomedInitiativeNode.subscribe((node: InitiativeNode) => {
      console.log(node);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    console.log('Coming soon to an SVG near you!');
  }
}
