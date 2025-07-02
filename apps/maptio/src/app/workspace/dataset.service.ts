import { inject, Injectable, signal } from '@angular/core';

import { Intercom } from '@supy-io/ngx-intercom';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { Tag } from '@maptio-shared/model/tag.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';

import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { DataService } from '@maptio-old-workspace/services/data.service';
import { MapService } from '@maptio-shared/services/map/map.service';
import { RoleLibraryService } from '@maptio-old-workspace/services/role-library.service';

// Old ways of handling global state I'd like to slowly refactor out
import { EmitterService } from '@maptio-core/services/emitter.service';
import { Store } from '@ngrx/store';
import { AppState } from '@maptio-state/app.state';
import { setCurrentOrganisationId } from '@maptio-state/global.actions';

// Probably should live elsewhere... but probably should be totally refactored
// anyway, so leaving here for now
export interface DataLoadStructure {
  dataset: DataSet;
  team: Team;
  members: User[];
  user: User;
}

export interface DataChangeStructure {
  initiative: Initiative;
  tags: Array<Tag>;
}

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  store = inject(Store<AppState>);
  dataService = inject(DataService);
  mapService = inject(MapService);
  roleLibrary = inject(RoleLibraryService);
  datasetFactory = inject(DatasetFactory);
  teamFactory = inject(TeamFactory);

  intercom = inject(Intercom);

  dataset = signal<DataSet>(null);
  datasetId = signal<string>(null);
  initiativeTree = signal<Initiative>(null);

  tags = signal<Array<Tag>>([]);

  // We need to update all of these when the dataset is updated
  // TODO: Actually, why exactly?
  user = signal<User>(null);
  team = signal<Team>(null);
  teamId = signal<string>(null);
  teamName = signal<string>(null);
  members = signal<Array<User>>([]);

  isSaving = signal<boolean>(false);
  isEmptyMap = signal<boolean>(true);

  constructor() {}

  loadData(data: {
    dataset: DataSet;
    team: Team;
    members: User[];
    user: User;
  }) {
    this.dataset.set(data.dataset);
    this.tags.set(data.dataset.tags);
    this.team.set(data.team);
    this.members.set(data.members);
    this.user.set(data.user);
    this.datasetId.set(this.dataset().datasetId);
    this.teamName.set(this.team().name);
    this.teamId.set(this.team().team_id);

    EmitterService.get('currentTeam').emit(this.team());

    const currentOrganisationId = this.team()?.team_id;
    this.store.dispatch(setCurrentOrganisationId({ currentOrganisationId }));

    this.isEmptyMap.set(
      !this.dataset().initiative.children ||
        this.dataset().initiative.children.length === 0,
    );
  }

  async saveChanges(change: { initiative: Initiative; tags: Array<Tag> }) {
    this.isSaving.set(true);
    this.isEmptyMap.set(
      !change.initiative.children || change.initiative.children.length === 0,
    );

    this.dataset.update(
      (dataset) =>
        new DataSet({
          ...dataset,
          initiative: change.initiative,
          tags: change.tags,
        }),
    );
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

    let depth = 0;
    change.initiative.traverse(() => {
      depth++;
    });

    let isLocalDatasetOutdated: boolean;
    try {
      isLocalDatasetOutdated = await this.mapService.isDatasetOutdated(
        this.dataset(),
        this.user(),
      );
    } catch (error) {
      this.handleSavingErrorAlert(error);
    }

    if (isLocalDatasetOutdated) {
      if (!this.mapService.hasOutdatedAlertBeenShownRecently(this.dataset())) {
        alert(
          $localize`A friendly heads-up: Your map has been changed by another user (or by you in a different browser tab). Please hit refresh to load the latest version, then you can make your edits. You can copy any text you just entered, ready to paste it in again after the refresh. Sorry for the hassle.`,
        );
      }
      return;
    }

    // Ensure that that the dataset and team versions of the role library are identical before saving
    const roleLibrary = this.roleLibrary.getRoles();
    this.dataset.update(
      (dataset) =>
        new DataSet({
          ...dataset,
          roles: roleLibrary,
        }),
    );
    this.team.update(
      (team) =>
        new Team({
          ...team,
          roles: roleLibrary,
        }),
    );

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
        },
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
      })
      .catch((reason) => {
        this.handleSavingErrorAlert(reason);
      });
  }

  private handleSavingErrorAlert(errorMessage = 'An unknown error occurred.') {
    if (!this.mapService.hasOutdatedAlertBeenShownRecently(this.dataset())) {
      alert(
        $localize`An error occurred while saving your changes. Please try making a change again or contact us at support@maptio.com if the error persists.`,
      );
    }
    console.error(errorMessage);
  }

  clearGlobalStateOnDestroy() {
    EmitterService.get('currentTeam').emit(undefined);
    this.store.dispatch(
      setCurrentOrganisationId({ currentOrganisationId: undefined }),
    );
  }
}
