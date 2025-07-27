import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { SidePanelLayoutService } from '@notebits/toolkit';

import { User } from '@maptio-shared/model/user.data';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';

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
  userService = inject(UserService);
  permissionsService = inject(PermissionsService);

  buildingComponent = signal<BuildingComponent>(null);

  openedNode = signal<Initiative>(null);

  isLoading = signal<boolean>(true);

  isBuildingVisible = signal<boolean>(true);
  isBuildingPanelCollapsed = signal<boolean>(true);
  isDetailsPanelCollapsed = signal<boolean>(false);
  isDetailsPanelOpen = this.sidePanelLayoutService.detailsPanelOpened;

  isOnboardingVideoVisible = signal<boolean>(false);

  // Signal to track when a new initiative is created and should have its name focused
  shouldFocusNewInitiativeName = signal<boolean>(false);

  // Passing these on as they're needed in component templates
  dataset = this.datasetService.dataset; // Needed? Check!
  datasetId = this.datasetService.datasetId;
  user = this.datasetService.user;
  team = this.datasetService.team;
  tags = this.datasetService.tags;
  isEmptyMap = this.datasetService.isEmptyMap;

  constructor() {
    // Initialize onboarding video visibility based on user preferences
    this.initializeOnboardingVideoVisibility();
  }

  private async initializeOnboardingVideoVisibility() {
    // Subscribe to user changes and update video visibility accordingly
    this.userService.user$.subscribe((user) => {
      if (user) {
        this.updateOnboardingVideoVisibility(user);
      }
    });
  }

  private updateOnboardingVideoVisibility(user: User) {
    const messageKey = 'showOnboardingVideo';

    // Check if user has permissions to see onboarding messages
    this.permissionsService.canSeeOnboardingMessages$.subscribe(
      (canSeeOnboardingMessages) => {
        if (
          canSeeOnboardingMessages &&
          user &&
          Object.prototype.hasOwnProperty.call(
            user.onboardingProgress,
            messageKey,
          )
        ) {
          // TODO: Change back once development is complete
          // this.isOnboardingVideoVisible.set(true);
          this.isOnboardingVideoVisible.set(
            user.onboardingProgress[messageKey] === true,
          );
        } else {
          this.isOnboardingVideoVisible.set(false);
        }
      },
    );
  }

  async toggleOnboardingVideo() {
    const user = await firstValueFrom(this.userService.user$);
    if (user) {
      const messageKey = 'showOnboardingVideo';
      const onboardingProgress = user.onboardingProgress;
      onboardingProgress[messageKey] = !this.isOnboardingVideoVisible();

      await this.userService.updateUserOnboardingProgress(
        user,
        onboardingProgress,
      );

      this.isOnboardingVideoVisible.set(onboardingProgress[messageKey]);
    }
  }

  async hideOnboardingVideo() {
    const user = await firstValueFrom(this.userService.user$);
    if (user) {
      const messageKey = 'showOnboardingVideo';
      const onboardingProgress = user.onboardingProgress;
      onboardingProgress[messageKey] = false;

      await this.userService.updateUserOnboardingProgress(
        user,
        onboardingProgress,
      );

      this.isOnboardingVideoVisible.set(false);
    }
  }

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
