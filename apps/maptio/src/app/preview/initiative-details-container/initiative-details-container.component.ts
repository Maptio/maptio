import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreviewService } from '@maptio-preview/preview.service';
import { InitiativeComponent } from '@maptio-old-workspace/components/data-entry/details/initiative.component';

@Component({
  selector: 'maptio-initiative-details-container',
  standalone: true,
  imports: [CommonModule, InitiativeComponent],
  templateUrl: './initiative-details-container.component.html',
  styleUrls: ['./initiative-details-container.component.scss'],
})
export class InitiativeDetailsContainerComponent {
  previewService = inject(PreviewService);

  showPanel = computed(
    () =>
      this.previewService.datasetId() &&
      !this.previewService.isDetailsPanelCollapsed()
  );
}
