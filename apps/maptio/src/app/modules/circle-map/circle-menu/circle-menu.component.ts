import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ItemMenuComponent,
  ItemMenuButtonComponent,
  MenuItemComponent,
} from '@notebits/sdk';

import { InitiativeNode } from '../initiative.model';

import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';
import { WorkspaceService } from '@maptio-workspace/workspace.service';

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
  private permissionsService = inject(PermissionsService);

  canPerformAdminActions(): boolean {
    return this.permissionsService.canOpenInitiativeContextMenu();
  }

  toggleDetailsPanel() {
    this.workspaceService.toggleDetailsPanel();
  }

  addSubcircle() {
    this.workspaceService.addSubcircle(this.circleNode.data.id);
  }

  deleteCircle() {
    this.workspaceService.deleteCircle(this.circleNode.data.id);
  }
}
