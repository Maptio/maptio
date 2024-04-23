import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildingComponent } from '@maptio-old-workspace/components/data-entry/hierarchy/building.component';
import { PreviewService } from '@maptio-preview/preview.service';

@Component({
  selector: 'maptio-structure-editor-container',
  standalone: true,
  imports: [CommonModule, BuildingComponent],
  templateUrl: './structure-editor-container.component.html',
  styleUrls: ['./structure-editor-container.component.scss'],
})
export class StructureEditorContainerComponent {
  previewService = inject(PreviewService);

  // TODO: Loginc from the building component needs to be moved to the service
  // to finally avoid this ridiculousness!
  @ViewChild('building', { static: true })
  buildingComponent: BuildingComponent;

  ngOnInit() {
    this.previewService.buildingComponent.set(this.buildingComponent);
  }
}
