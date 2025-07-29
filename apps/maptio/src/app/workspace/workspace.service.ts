import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { SidePanelLayoutService } from '@notebits/toolkit';

import { Initiative } from '@maptio-shared/model/initiative.data';

import { BuildingComponent } from '@maptio-old-workspace/components/data-entry/hierarchy/building.component';

import {
  DatasetService,
  DataLoadStructure,
  DataChangeStructure,
} from './dataset.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  datasetService = inject(DatasetService);
  sidePanelLayoutService = inject(SidePanelLayoutService);

  buildingComponent = signal<BuildingComponent>(null);

  openedNode = signal<Initiative>(null);

  isLoading = signal<boolean>(true);

  isBuildingVisible = signal<boolean>(true);
  isBuildingPanelCollapsed = signal<boolean>(true);
  isDetailsPanelCollapsed = signal<boolean>(false);
  isDetailsPanelOpen = this.sidePanelLayoutService.detailsPanelOpened;

  // Signal to track when a new initiative is created and should have its name focused
  shouldFocusNewInitiativeName = signal<boolean>(false);

  // Passing these on as they're needed in component templates
  dataset = this.datasetService.dataset; // Needed? Check!
  datasetId = this.datasetService.datasetId;
  user = this.datasetService.user;
  team = this.datasetService.team;
  tags = this.datasetService.tags;
  isEmptyMap = this.datasetService.isEmptyMap;

  loadData(data: DataLoadStructure) {
    this.datasetService.loadData(data);
  }

  async saveChanges(change: DataChangeStructure) {
    this.datasetService.saveChanges(change);
  }

  clearGlobalStateOnDestroy() {
    this.datasetService.clearGlobalStateOnDestroy();
  }

  addSubcircle(parentId: number) {
    this.buildingComponent().onInitiativeCreate(parentId);
    this.openDetailsPanel();
    // Set flag to indicate that the new initiative should have its name focused
    this.shouldFocusNewInitiativeName.set(true);
  }

  deleteCircle(initiativeId: number) {
    this.buildingComponent().onInitiativeDelete(initiativeId);
  }

  sendInitiativesToOutliner(rootNode: Initiative) {
    this.buildingComponent().sendInitiativesToOutliner(rootNode);
  }

  saveDetailChanges() {
    this.buildingComponent().saveChangesAndUpdateOutliner();
  }

  onOpenDetails(node: Initiative) {
    this.highlightToggleWhenDetailsPanelIsClosed(this.openedNode(), node);
    this.openedNode.set(node);
  }

  private highlightToggleWhenDetailsPanelIsClosed(
    currentNode: Initiative,
    newNode: Initiative,
  ) {
    const isDetailsPanelClosed =
      !this.sidePanelLayoutService.detailsPanelOpened();

    // This prevents the highlight from showing e.g. when the user is switching
    // between circle views (a bit of an indirect way, but also very simple)
    const isTheNodeChanging = currentNode?.id !== newNode?.id;

    if (isDetailsPanelClosed && isTheNodeChanging) {
      this.sidePanelLayoutService.highlightDetailsPanelToggle();
    }
  }

  openNavigationPanel() {
    this.sidePanelLayoutService.openNavigationPanel();
  }

  closeNavigationPanel() {
    this.sidePanelLayoutService.closeNavigationPanel();
  }

  openDetailsPanel() {
    this.sidePanelLayoutService.openDetailsPanel();
  }

  closeDetailsPanel() {
    this.sidePanelLayoutService.closeDetailsPanel();
  }

  toggleDetailsPanel() {
    this.sidePanelLayoutService.toggleDetailsPanel();
  }

  toggleEditingPanelsVisibility(isVisible: boolean) {
    if (isVisible) {
      this.enableBothPanels();
    } else {
      this.disableBothPanels();
    }
  }

  // TODO: Remove
  openBuildingPanel() {
    this.isBuildingPanelCollapsed.set(false);
  }

  // TODO: Remove
  closeBuildingPanel() {
    this.isBuildingPanelCollapsed.set(true);
  }

  disableBothPanels() {
    this.sidePanelLayoutService.disableBothPanels();
  }

  enableBothPanels() {
    this.sidePanelLayoutService.enableBothPanels();
  }

  onEditTags() {
    this.openNavigationPanel();
    this.buildingComponent().tabs.select('tags-tab');
  }
}
