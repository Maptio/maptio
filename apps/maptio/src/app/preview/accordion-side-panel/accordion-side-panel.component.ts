import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'maptio-accordion-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-side-panel.component.html',
  styleUrls: ['./accordion-side-panel.component.scss'],
})
export class AccordionSidePanelComponent {
  public isBuildingPanelCollapsed = true;
  public isDetailsPanelCollapsed = true;
  public isBuildingVisible = true;

  openBuildingPanel() {
    this.isBuildingPanelCollapsed = false;
    // this.resizeMap();
    // this.cd.markForCheck();
  }

  closeBuildingPanel() {
    this.isBuildingPanelCollapsed = true;
    // this.resizeMap();
    // this.cd.markForCheck();
  }

  closeDetailsPanel() {
    this.isDetailsPanelCollapsed = true;
    // this.resizeMap();
    // this.cd.markForCheck();
  }
}
