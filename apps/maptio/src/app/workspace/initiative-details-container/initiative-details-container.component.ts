import { Component, computed, inject } from '@angular/core';


import { WorkspaceService } from '../workspace.service';
import { InitiativeComponent } from '@maptio-old-workspace/components/data-entry/details/initiative.component';

@Component({
    selector: 'maptio-initiative-details-container',
    imports: [InitiativeComponent],
    templateUrl: './initiative-details-container.component.html',
    styleUrls: ['./initiative-details-container.component.scss']
})
export class InitiativeDetailsContainerComponent {
  workspaceService = inject(WorkspaceService);

  showPanel = computed(
    () =>
      this.workspaceService.datasetId() &&
      !this.workspaceService.isDetailsPanelCollapsed()
  );
}
