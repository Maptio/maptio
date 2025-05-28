import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ItemMenuComponent,
  ItemMenuButtonComponent,
  MenuItemComponent,
} from '@notebits/sdk';
import { WorkspaceService } from '../../../workspace/workspace.service';

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

  private workspaceService = inject(WorkspaceService);

  toggleDetailsPanel() {
    this.workspaceService.toggleDetailsPanel();
  }
}
