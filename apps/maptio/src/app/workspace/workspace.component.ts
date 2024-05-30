import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Store } from '@ngrx/store';

import { SidePanelLayoutComponent } from '@notebits/toolkit';

import { EmitterService } from '@maptio-core/services/emitter.service';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';
import { AppState } from '@maptio-state/app.state';
import { setCurrentOrganisationId } from '@maptio-state/global.actions';

import { WorkspaceService } from '@maptio-workspace/workspace.service';
import { MapContainerComponent } from '@maptio-workspace/map-container/map-container.component';
import { InitiativeDetailsContainerComponent } from '@maptio-workspace/initiative-details-container/initiative-details-container.component';
import { StructureEditorContainerComponent } from '@maptio-workspace/structure-editor-container/structure-editor-container.component';

// TODO: Move these components slowly into the new standalone component workspace
import { WorkspaceFacade } from '@maptio-old-workspace/+state/workspace.facade';
import { BuildingComponent } from '@maptio-old-workspace/components/data-entry/hierarchy/building.component';
import { UIService } from '@maptio-old-workspace/services/ui.service';
import { MapSettingsService } from '@maptio-old-workspace/services/map-settings.service';

@Component({
  selector: 'maptio-workspace',
  templateUrl: 'workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    BuildingComponent,
    NgClass,
    SidePanelLayoutComponent,
    MapContainerComponent,
    StructureEditorContainerComponent,
    InitiativeDetailsContainerComponent,
  ],
  providers: [UIService, MapSettingsService, WorkspaceFacade],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  workspaceService = inject(WorkspaceService);

  private routeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.workspaceService.isLoading.set(true);
    this.cd.markForCheck();

    // TODO: Set timeout is needed to make sure the building component is set
    // before the data is loaded (see the above too console logs). This is
    // obviously a hack from hell - let's move the building component code out
    // into a service...
    setTimeout(() => {
      this.routeSubscription = this.route.data
        .pipe(
          tap((data) => {
            const newDatasetId = data.data.dataset.datasetId;
            if (newDatasetId !== this.workspaceService.datasetId()) {
              // TODO: Move to store / service
              // this.isBuildingPanelCollapsed = false;
              // this.isDetailsPanelCollapsed = true;
              this.cd.markForCheck();
            }
          }),
          tap(
            (data: {
              data: {
                dataset: DataSet;
                team: Team;
                members: User[];
                user: User;
              };
            }) => {
              this.workspaceService.isLoading.set(true);
              this.cd.markForCheck();
              return this.workspaceService
                .buildingComponent()
                .loadData(data.data.dataset, data.data.team, data.data.members)
                .then(() => {
                  // Hack to make sure the circle details panel stays closed...
                  // TODO: Remove this when we've got good enough state
                  // management here
                  setTimeout(() => {
                    // TODO: Move to service
                    // this.closeDetailsPanel();
                  }, 100);
                  this.workspaceService.isLoading.set(false);
                  this.cd.markForCheck();
                });
            }
          )
        )
        .subscribe(
          (data: {
            data: { dataset: DataSet; team: Team; members: User[]; user: User };
          }) => {
            this.workspaceService.dataset.set(data.data.dataset);
            this.workspaceService.tags.set(data.data.dataset.tags);
            this.workspaceService.team.set(data.data.team);
            this.workspaceService.members.set(data.data.members);
            this.workspaceService.user.set(data.data.user);
            this.workspaceService.datasetId.set(
              this.workspaceService.dataset().datasetId
            );
            this.workspaceService.teamName.set(
              this.workspaceService.team().name
            );
            this.workspaceService.teamId.set(
              this.workspaceService.team().team_id
            );
            EmitterService.get('currentTeam').emit(
              this.workspaceService.team()
            );

            const currentOrganisationId = this.workspaceService.team()?.team_id;
            this.store.dispatch(
              setCurrentOrganisationId({ currentOrganisationId })
            );

            this.workspaceService.isEmptyMap.set(
              !this.workspaceService.dataset().initiative.children ||
                this.workspaceService.dataset().initiative.children.length === 0
            );
            this.cd.markForCheck();
          }
        );
    });
  }

  ngOnDestroy(): void {
    EmitterService.get('currentTeam').emit(undefined);
    this.store.dispatch(
      setCurrentOrganisationId({ currentOrganisationId: undefined })
    );

    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}
