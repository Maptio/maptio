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

  isDetailsPanelOpen = this.workspaceService.isDetailsPanelOpen;

  public blobX = 0;
  public blobY = 0;

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

  /**
   * Returns a path string for a single circle centered at (0,0) with the given radius.
   */
  getBlobPath(): string {
    const bubbleRadius = 37;
    // The rightmost point of the bubble
    const bubbleRightX = bubbleRadius;
    const bubbleRightY = 0;
    // The top of the bubble
    const bubbleTopX = 0;
    const bubbleTopY = -bubbleRadius;

    // The main circle center in menu's local coordinates
    const defaultRadius = this.defaultRadius;
    const offset = 1.08 * defaultRadius * 0.707;
    const mainCircleX = -offset;
    const mainCircleY = offset;
    const rSquared = defaultRadius * defaultRadius;

    // --- Vertical line intersection ---
    const dx = bubbleRightX - mainCircleX;
    const underSqrt = rSquared - dx * dx;
    let edgeY: number;
    if (underSqrt >= 0) {
      const sqrtVal = Math.sqrt(underSqrt);
      const y1 = mainCircleY + sqrtVal;
      const y2 = mainCircleY - sqrtVal;
      const candidates = [y1, y2].filter((y) => y > bubbleRightY);
      edgeY = Math.min(...candidates);
    } else {
      edgeY = bubbleRightY + 20;
    }
    // Point B: (bubbleRightX, edgeY)

    // --- Horizontal line intersection ---
    const dy2 = bubbleTopY - mainCircleY;
    const underSqrt2 = rSquared - dy2 * dy2;
    let edgeX: number;
    if (underSqrt2 >= 0) {
      const sqrtVal2 = Math.sqrt(underSqrt2);
      const x1 = mainCircleX + sqrtVal2;
      const x2 = mainCircleX - sqrtVal2;
      const candidates2 = [x1, x2].filter((x) => x < bubbleTopX);
      edgeX = Math.max(...candidates2);
    } else {
      edgeX = bubbleTopX - 20;
    }
    // Point C: (edgeX, bubbleTopY)

    // Main circle arc from B to C
    // Always use large-arc-flag 0 (short arc)
    // Calculate sweep-flag using cross product to determine direction
    // Vectors from main circle center to B and C
    const vB = [bubbleRightX - mainCircleX, edgeY - mainCircleY];
    const vC = [edgeX - mainCircleX, bubbleTopY - mainCircleY];
    // Cross product z-component
    const cross = vB[0] * vC[1] - vB[1] * vC[0];
    // If cross > 0, sweep-flag = 1 (clockwise), else 0 (counterclockwise)
    const arcSweep = cross > 0 ? 1 : 0;

    // Small circle arc from D to A (clockwise, so sweep-flag 1)

    // Path: A -> B (line), B -> C (main circle arc), C -> D (line), D -> A (small circle arc)
    return [
      `M ${bubbleRightX} ${bubbleRightY}`,
      `L ${bubbleRightX} ${edgeY}`,
      `A ${defaultRadius} ${defaultRadius} 0 0 ${arcSweep} ${edgeX} ${bubbleTopY}`,
      `L ${bubbleTopX} ${bubbleTopY}`,
      `A ${bubbleRadius} ${bubbleRadius} 0 0 1 ${bubbleRightX} ${bubbleRightY}`,
      'Z',
    ].join(' ');
  }
}
