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
  previewService = inject(PreviewService);

  // TODO: Loginc from the building component needs to be moved to the service
  // to finally avoid this ridiculousness!
  @ViewChild('building', { static: true })
  buildingComponent: BuildingComponent;

  ngOnInit() {
    this.previewService.buildingComponent.set(this.buildingComponent);
  }
}
