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
    // Angles in radians
    const angleD = (-105 * Math.PI) / 180; // -10° (topmost)
    const angleA = (15 * Math.PI) / 180; // 100° (rightmost)
    // The new start/end points on the small circle
    const bubbleTopX = bubbleRadius * Math.cos(angleD);
    const bubbleTopY = bubbleRadius * Math.sin(angleD);
    const bubbleRightX = bubbleRadius * Math.cos(angleA);
    const bubbleRightY = bubbleRadius * Math.sin(angleA);

    // The main circle center in menu's local coordinates
    const defaultRadius = this.defaultRadius;
    const offset = 1.08 * defaultRadius * 0.707;
    const mainCircleX = -offset;
    const mainCircleY = offset;
    const rSquared = defaultRadius * defaultRadius;

    // --- Vertical line intersection (from bubbleRightX, bubbleRightY straight down) ---
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

    // --- Horizontal line intersection (from bubbleTopX, bubbleTopY straight left) ---
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

    // --- Bezier control points ---
    // For A->B
    const midABx = (bubbleRightX + bubbleRightX) / 2;
    const midABy = (bubbleRightY + edgeY) / 2;
    const toMainABx = mainCircleX - bubbleRightX;
    const toMainABy = mainCircleY - (bubbleRightY + edgeY) / 2;
    const lenAB = Math.sqrt(toMainABx * toMainABx + toMainABy * toMainABy);
    const ctrlABx = midABx + (toMainABx / lenAB) * 30;
    const ctrlABy = midABy + (toMainABy / lenAB) * 30;

    // For D->C
    const midDCx = (bubbleTopX + edgeX) / 2;
    const midDCy = (bubbleTopY + bubbleTopY) / 2;
    const toMainDCx = mainCircleX - (bubbleTopX + edgeX) / 2;
    const toMainDCy = mainCircleY - bubbleTopY;
    const lenDC = Math.sqrt(toMainDCx * toMainDCx + toMainDCy * toMainDCy);
    const ctrlDCx = midDCx + (toMainDCx / lenDC) * 30;
    const ctrlDCy = midDCy + (toMainDCy / lenDC) * 30;

    // Main circle arc from B to C
    const vB = [bubbleRightX - mainCircleX, edgeY - mainCircleY];
    const vC = [edgeX - mainCircleX, bubbleTopY - mainCircleY];
    const cross = vB[0] * vC[1] - vB[1] * vC[0];
    const arcSweep = cross > 0 ? 1 : 0;

    // Path: A -> B (bezier), B -> C (main circle arc), C -> D (bezier), D -> A (small circle arc)
    return [
      `M ${bubbleRightX} ${bubbleRightY}`,
      `Q ${ctrlABx} ${ctrlABy} ${bubbleRightX} ${edgeY}`,
      `A ${defaultRadius} ${defaultRadius} 0 0 ${arcSweep} ${edgeX} ${bubbleTopY}`,
      `Q ${ctrlDCx} ${ctrlDCy} ${bubbleTopX} ${bubbleTopY}`,
      `A ${bubbleRadius} ${bubbleRadius} 0 0 1 ${bubbleRightX} ${bubbleRightY}`,
      'Z',
    ].join(' ');
  }
}
