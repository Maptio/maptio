import { Component, inject } from '@angular/core';


import { MappingComponent } from '@maptio-old-workspace/components/canvas/mapping.component';

import { WorkspaceService } from '../workspace.service';

@Component({
    selector: 'maptio-map-container',
    imports: [MappingComponent],
    templateUrl: './map-container.component.html',
    styleUrls: ['./map-container.component.scss']
})
export class MapContainerComponent {
  workspaceService = inject(WorkspaceService);
}
