import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ItemMenuComponent,
  ItemMenuButtonComponent,
  MenuItemComponent,
} from '@notebits/sdk';
import { WorkspaceService } from '../../../workspace/workspace.service';
import { InitiativeNode } from '../initiative.model';
import { MapEditingService } from '../../../modules/workspace/services/map-editing.service';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { CircleMapService } from '../circle-map.service';
import { WorkspaceFacade } from '../../workspace/+state/workspace.facade';

@Component({
  selector: 'g[maptioCircleMenu]',
  templateUrl: './circle-menu.component.html',
  styleUrls: ['./circle-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ItemMenuComponent,
    ItemMenuButtonComponent,
    MenuItemComponent,
  ],
})
export class CircleMenuComponent {
  @Input() defaultRadius: number;
  @Input() circleNode!: InitiativeNode;

  private workspaceService = inject(WorkspaceService);
  private mapEditingService = inject(MapEditingService);
  private circleMapService = inject(CircleMapService);
  private workspaceFacade = inject(WorkspaceFacade);

  toggleDetailsPanel() {
    this.workspaceService.toggleDetailsPanel();
  }

  async addSubcircle() {
    this.workspaceService.addSubcircle(this.circleNode.data.id);
  }

  async deleteCircle() {
    if (this.circleNode) {
      await this.mapEditingService.deleteNodeByIdFromWorkspaceAndSave(
        this.circleNode.data.id,
      );
    }
  }
}

// Helper function to find Initiative by id
function findInitiativeById(
  root: Initiative,
  id: number,
): Initiative | undefined {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findInitiativeById(child, id);
      if (found) return found;
    }
  }
  return undefined;
}
