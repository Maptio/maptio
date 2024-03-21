import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  inject,
} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Subscription, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Intercom } from '@supy-io/ngx-intercom';

import { EmitterService } from '@maptio-core/services/emitter.service';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';
import { Tag } from '@maptio-shared/model/tag.data';
import { Role } from '@maptio-shared/model/role.data';
import { MapService } from '@maptio-shared/services/map/map.service';
import { AppState } from '@maptio-state/app.state';
import { setCurrentOrganisationId } from '@maptio-state/global.actions';

import { WorkspaceComponentResolver } from '@maptio-old-workspace/pages/workspace/workspace.resolver';
import { WorkspaceFacade } from '@maptio-old-workspace/+state/workspace.facade';
import { DataService } from '@maptio-old-workspace/services/data.service';
import { RoleLibraryService } from '@maptio-old-workspace/services/role-library.service';
import { BuildingComponent } from '@maptio-old-workspace/components/data-entry/hierarchy/building.component';
import { MappingComponent } from '@maptio-old-workspace/components/canvas/mapping.component';
import { InitiativeComponent } from '@maptio-old-workspace/components/data-entry/details/initiative.component';
import { UIService } from '@maptio-old-workspace/services/ui.service';
import { MapSettingsService } from '@maptio-old-workspace/services/map-settings.service';

import { PreviewService } from './preview.service';
import { MapContainerComponent } from './map-container/map-container.component';
import { AccordionSidePanelComponent } from './accordion-side-panel/accordion-side-panel.component';

@Component({
  selector: 'maptio-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    BuildingComponent,
    NgClass,
    MapContainerComponent,
    AccordionSidePanelComponent,
  ],
  providers: [
    // BillingGuard,
    // WorkspaceGuard,
    UIService,
    DataService,
    RoleLibraryService,
    MapSettingsService,
    // WorkspaceComponentResolver,
    WorkspaceFacade,
  ],
})
export class PreviewComponent implements OnInit, OnDestroy {
  previewService = inject(PreviewService);

  private routeSubscription: Subscription;

  // public isSaving: boolean;
  // public isEditMode: boolean;
  // public datasetId: string;

  // public dataset: DataSet;
  // public members: Array<User>;
  // public team: Team;
  // public teams: Team[];
  // public tags: Tag[];
  // public roles: Role[];
  // public canvasYMargin: number;
  // public canvasHeight: number;

  // public openedNode: Initiative;
  // public openedNodeParent: Initiative;
  // public openedNodeTeamId: string;
  // public openEditTag$: Subject<void> = new Subject<void>();

  // public mapped: Initiative;
  // teamName: string;
  // teamId: string;
  // selectableTags: Array<Tag>;

  // TODO: Delete, this isn't used anymore!
  // @ViewChild('dragConfirmation')
  // dragConfirmationModal: NgbModal;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private store: Store<AppState>,
    private datasetFactory: DatasetFactory,
    private teamFactory: TeamFactory,
    private dataService: DataService,
    private mapService: MapService,
    private roleLibrary: RoleLibraryService,
    private intercom: Intercom
  ) {}

  ngOnInit() {
    this.previewService.isLoading.set(true);
    this.cd.markForCheck();

    console.log(
      'buildingComponent from preview',
      this.previewService.buildingComponent()
    );

    setTimeout(() => {
      console.log(
        'buildingComponent from preview ... after a while',
        this.previewService.buildingComponent()
      );
    });

    // TODO: Set timeout is needed to make sure the building component is set
    // before the data is loaded (see the above too console logs). This is
    // obviously a hack from hell - let's move the building component code out
    // into a service...
    setTimeout(() => {
      this.routeSubscription = this.route.data
        .pipe(
          tap((data) => {
            const newDatasetId = data.data.dataset.datasetId;
            if (newDatasetId !== this.previewService.datasetId()) {
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
              this.previewService.isLoading.set(true);
              this.cd.markForCheck();
              return this.previewService
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
                  this.previewService.isLoading.set(false);
                  this.cd.markForCheck();
                });
            }
          )
        )
        .subscribe(
          (data: {
            data: { dataset: DataSet; team: Team; members: User[]; user: User };
          }) => {
            this.previewService.dataset.set(data.data.dataset);
            this.previewService.tags.set(data.data.dataset.tags);
            this.previewService.team.set(data.data.team);
            this.previewService.members.set(data.data.members);
            this.previewService.user.set(data.data.user);
            this.previewService.datasetId.set(
              this.previewService.dataset().datasetId
            );
            this.previewService.teamName.set(this.previewService.team().name);
            this.previewService.teamId.set(this.previewService.team().team_id);
            EmitterService.get('currentTeam').emit(this.previewService.team());

            console.log('shoudlb e decbipachti');
            const currentOrganisationId = this.previewService.team()?.team_id;
            this.store.dispatch(
              setCurrentOrganisationId({ currentOrganisationId })
            );

            this.previewService.isEmptyMap.set(
              !this.previewService.dataset().initiative.children ||
                this.previewService.dataset().initiative.children.length === 0
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

  saveDetailChanges() {
    this.previewService.buildingComponent().saveChangesAndUpdateOutliner();
  }

  // applySettings(data: { initiative: Initiative, tags: Tag[] }) {
  //     data.initiative.traverse((node: Initiative) => {
  //         node.tags = intersectionBy(data.tags, node.tags, (t: Tag) => t.shortid);
  //     })
  //     this.saveChanges(data.initiative, data.tags);
  //     this.cd.markForCheck();
  // }

  // TODO Unused, I think, delete?
  // toggleEditMode() {
  //   this.isEditMode = !this.isEditMode;
  //   this.cd.markForCheck();
  // }

  addInitiative(data: { node: Initiative; subNode: Initiative }) {
    this.previewService.buildingComponent().addNodeTo(data.node, data.subNode);
  }

  // openDetailsPanel() {
  //   this.isDetailsPanelCollapsed = false;
  //   // this.resizeMap();
  //   this.cd.markForCheck();
  // }

  // onEditTags() {
  //   this.isBuildingPanelCollapsed = false;
  //   this.buildingComponent.tabs.select('tags-tab');
  //   this.cd.markForCheck();
  // }

  // private resizeMap() {
  //     let outerSvg = document.querySelector("svg#map");
  //     let innerSvg = document.querySelector("svg#map > svg");
  //     if (!outerSvg || !innerSvg) return;
  //     let margin = this.uiService.getCenteredMargin();
  //     innerSvg.setAttribute("x", margin);
  // }

  // private isZeroPanelOpened() {
  //   return this.isBuildingPanelCollapsed && this.isDetailsPanelCollapsed;
  // }

  // private isOnePanelOpened() {
  //   return this.isBuildingPanelCollapsed !== this.isDetailsPanelCollapsed;
  // }

  // private isTwoPanelsOpened() {
  //   return !this.isDetailsPanelCollapsed && !this.isBuildingPanelCollapsed;
  // }
}
