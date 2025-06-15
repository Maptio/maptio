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

  toggleDetailsPanel() {
    this.workspaceService.toggleDetailsPanel();
  }

  async deleteCircle() {
    if (this.circleNode) {
      await this.mapEditingService.deleteNodeByIdFromWorkspaceAndSave(
        this.circleNode.data.id
      );
    }
  }
}
