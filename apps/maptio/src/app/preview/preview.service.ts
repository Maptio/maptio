import { Injectable, inject, signal } from '@angular/core';

import { Intercom } from '@supy-io/ngx-intercom';

import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';

import { User } from '@maptio-shared/model/user.data';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { Tag } from '@maptio-shared/model/tag.data';
import { MapService } from '@maptio-shared/services/map/map.service';
import { RoleLibraryService } from '@maptio-old-workspace/services/role-library.service';

import { BuildingComponent } from '@maptio-old-workspace/components/data-entry/hierarchy/building.component';
import { DataService } from '@maptio-old-workspace/services/data.service';
import { Team } from '@maptio-shared/model/team.data';

@Injectable({
  providedIn: 'root',
})
export class PreviewService {
  dataService = inject(DataService);
  mapService = inject(MapService);
  roleLibrary = inject(RoleLibraryService);
  datasetFactory = inject(DatasetFactory);
  teamFactory = inject(TeamFactory);

  intercom = inject(Intercom);

  buildingComponent = signal<BuildingComponent>(null);

  user = signal<User>(null);

  dataset = signal<DataSet>(null);
  datasetId = signal<string>(null);

  team = signal<Team>(null);
  teamId = signal<string>(null);
  teamName = signal<string>(null);

  members = signal<Array<User>>([]);
  tags = signal<Array<Tag>>([]);

  openedNode = signal<Initiative>(null);

  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isEmptyMap = signal<boolean>(true);

  isBuildingVisible = signal<boolean>(true);
  isBuildingPanelCollapsed = signal<boolean>(true);
  isDetailsPanelCollapsed = signal<boolean>(false);

  constructor() {}

  async saveChanges(change: { initiative: Initiative; tags: Array<Tag> }) {
    this.isSaving.set(true);
    this.isEmptyMap.set(
      !change.initiative.children || change.initiative.children.length === 0
    );

    this.dataset.mutate((dataset) => {
      dataset.initiative = change.initiative;
      dataset.tags = change.tags;
    });
    this.tags.set(change.tags);

    // Performing an optimistic update of the UI before saving. If the save
    // fails, we just show an error message and don't revert the UI.
    // TODO: Revert the UI if the save fails
    // TODO: Make the error message nicer
    this.dataService.set({
      initiative: change.initiative,
      dataset: this.dataset(),
      team: this.team(),
      members: this.members(),
    });

    // this.cd.markForCheck();

    let depth = 0;
    change.initiative.traverse(() => {
      depth++;
    });

    let isLocalDatasetOutdated: boolean;
    try {
      isLocalDatasetOutdated = await this.mapService.isDatasetOutdated(
        this.dataset(),
        this.user()
      );
    } catch (error) {
      this.handleSavingErrorAlert(error);
    }

    if (isLocalDatasetOutdated) {
      if (!this.mapService.hasOutdatedAlertBeenShownRecently(this.dataset())) {
        alert(
          $localize`A friendly heads-up: Your map has been changed by another user (or by you in a different browser tab). Please hit refresh to load the latest version, then you can make your edits. You can copy any text you just entered, ready to paste it in again after the refresh. Sorry for the hassle.`
        );
      }
      return;
    }

    // Ensure that that the dataset and team versions of the role library are identical before saving
    const roleLibrary = this.roleLibrary.getRoles();
    this.dataset.mutate((dataset) => {
      dataset.roles = roleLibrary;
    });
    this.team.mutate((team) => {
      team.roles = roleLibrary;
    });

    Promise.all([
      this.datasetFactory.upsert(this.dataset(), this.datasetId()),
      this.teamFactory.upsert(this.team()),
    ])
      .then(
        ([hasSavedDataset, hasSavedTeam]: [boolean, boolean]) => {
          return hasSavedDataset && hasSavedTeam;
        },
        (reason) => {
          this.handleSavingErrorAlert(reason);
        }
      )
      .then((hasSaved) => {
        if (!hasSaved) {
          this.handleSavingErrorAlert();
        }
      })
      .then(() => {
        this.intercom.trackEvent('Editing map', {
          team: this.team().name,
          teamId: this.team().team_id,
          datasetId: this.datasetId(),
          mapName: change.initiative.name,
          circles: depth,
        });
        return;
      })
      .then(() => {
        this.isSaving.set(false);
        // this.cd.markForCheck();
      })
      .catch((reason) => {
        this.handleSavingErrorAlert(reason);
      });
  }

  saveDetailChanges() {
    this.buildingComponent().saveChangesAndUpdateOutliner();
  }

  private handleSavingErrorAlert(errorMessage = 'An unknown error occurred.') {
    if (!this.mapService.hasOutdatedAlertBeenShownRecently(this.dataset())) {
      alert(
        $localize`An error occurred while saving your changes. Please try making a change again or contact us at support@maptio.com if the error persists.`
      );
    }
    console.error(errorMessage);
  }

  onOpenDetails(node: Initiative) {
    console.log('onOpenDetails', node);
    this.openedNode.set(node);

    if (this.isDetailsPanelCollapsed()) this.openDetailsPanel();
  }

  toggleEditingPanelsVisibility(isVisible: boolean) {
    this.isBuildingVisible.set(isVisible);
  }

  openBuildingPanel() {
    this.isBuildingPanelCollapsed.set(false);
    // this.cd.markForCheck();
  }

  closeBuildingPanel() {
    this.isBuildingPanelCollapsed.set(true);
    // this.cd.markForCheck();
  }

  openDetailsPanel() {
    this.isDetailsPanelCollapsed.set(false);
    // this.cd.markForCheck();
  }

  closeDetailsPanel() {
    this.isDetailsPanelCollapsed.set(true);
    // this.cd.markForCheck();
  }

  onEditTags() {
    this.isBuildingPanelCollapsed.set(false);
    this.buildingComponent().tabs.select('tags-tab');
    //   this.cd.markForCheck();
  }
}
