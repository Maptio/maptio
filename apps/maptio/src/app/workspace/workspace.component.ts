import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SidePanelLayoutComponent } from '@notebits/toolkit';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';

import { WorkspaceService } from '@maptio-workspace/workspace.service';
import { MapContainerComponent } from '@maptio-workspace/map-container/map-container.component';
import { InitiativeDetailsContainerComponent } from '@maptio-workspace/initiative-details-container/initiative-details-container.component';
import { StructureEditorContainerComponent } from '@maptio-workspace/structure-editor-container/structure-editor-container.component';
import { OnboardingVideoComponent } from './onboarding-video/onboarding-video.component';

// TODO: Move these components slowly into the new standalone component workspace
import { WorkspaceFacade } from '@maptio-old-workspace/+state/workspace.facade';
import { UIService } from '@maptio-old-workspace/services/ui.service';
import { MapSettingsService } from '@maptio-old-workspace/services/map-settings.service';

@Component({
  selector: 'maptio-workspace',
  templateUrl: 'workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SidePanelLayoutComponent,
    MapContainerComponent,
    StructureEditorContainerComponent,
    InitiativeDetailsContainerComponent,
    OnboardingVideoComponent,
  ],
  providers: [UIService, MapSettingsService, WorkspaceFacade],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  workspaceService = inject(WorkspaceService);

  private routeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
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
            },
          ),
        )
        .subscribe(
          (data: {
            data: { dataset: DataSet; team: Team; members: User[]; user: User };
          }) => {
            this.workspaceService.loadData(data.data);
            this.cd.markForCheck();
          },
        );
    });
  }

  ngOnDestroy(): void {
    this.workspaceService.clearGlobalStateOnDestroy();

    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}
