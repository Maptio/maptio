import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Initiative } from '@maptio-shared/model/initiative.data';

import { BuildingComponent } from '@maptio-old-workspace/components/data-entry/hierarchy/building.component';
import { InitiativeComponent } from '@maptio-old-workspace/components/data-entry/details/initiative.component';

import { PreviewService } from '@maptio-preview/preview.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'maptio-accordion-side-panel',
  standalone: true,
  imports: [
    CommonModule,
    NgbCollapseModule,
    BuildingComponent,
    InitiativeComponent,
  ],
  templateUrl: './accordion-side-panel.component.html',
  styleUrls: ['./accordion-side-panel.component.scss'],
})
export class AccordionSidePanelComponent {
  // TODO : Remove me once I'm done with bootstrap example...
  isCollapsed = false;

  previewService = inject(PreviewService);

  @ViewChild('building', { static: true })
  buildingComponent: BuildingComponent;

  public isBuildingPanelCollapsed = true;
  public isDetailsPanelCollapsed = true;

  ngOnInit() {
    console.log('buildingComponent from side panel', this.buildingComponent);
    this.previewService.buildingComponent.set(this.buildingComponent);
  }

  openBuildingPanel() {
    this.isBuildingPanelCollapsed = false;
    // this.resizeMap();
    // this.cd.markForCheck();
  }

  closeBuildingPanel() {
    this.isBuildingPanelCollapsed = true;
    // this.resizeMap();
    // this.cd.markForCheck();
  }

  closeDetailsPanel() {
    this.isDetailsPanelCollapsed = true;
    // this.resizeMap();
    // this.cd.markForCheck();
  }
}
