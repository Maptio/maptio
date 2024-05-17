import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MappingComponent } from '@maptio-old-workspace/components/canvas/mapping.component';

import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'maptio-map-container',
  standalone: true,
  imports: [CommonModule, MappingComponent],
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss'],
})
export class MapContainerComponent {
  workspaceService = inject(WorkspaceService);
}
