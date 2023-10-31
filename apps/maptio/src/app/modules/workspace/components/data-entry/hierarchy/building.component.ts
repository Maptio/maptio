import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  inject,
  signal,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIf } from '@angular/common';

import { Subscription, map } from 'rxjs';

import {
  NgbModal,
  NgbNav,
  NgbNavModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { intersectionBy } from 'lodash';

import {
  OutlineModule,
  NotebitsOutlineData,
  OutlineItemEditEvent,
  OutlineItemMoveEvent,
} from '@notebits/outline';

import { UserFactory } from '@maptio-core/http/user/user.factory';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';

import { User } from '@maptio-shared/model/user.data';
import { Team } from '@maptio-shared/model/team.data';
import { Permissions } from '@maptio-shared/model/permission.data';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';
import { Tag } from '@maptio-shared/model/tag.data';
import { Role } from '@maptio-shared/model/role.data';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { StickyPopoverDirective } from '@maptio-shared/directives/sticky.directive';
import { PermissionsDirective } from '@maptio-shared/directives/permission.directive';

import { CircleMapService } from '@maptio-circle-map/circle-map.service';
import { CircleMapService as CircleMapServiceExpanded } from '@maptio-circle-map-expanded/circle-map.service';

import { InsufficientPermissionsMessageComponent } from '../../../../permissions-messages/insufficient-permissions-message.component';
import { OnboardingMessageComponent } from '../../../../onboarding-message/onboarding-message/onboarding-message.component';
import { WorkspaceFacade } from '../../../+state/workspace.facade';
import { DataService } from '../../../services/data.service';
import { RoleLibraryService } from '../../../services/role-library.service';
import { EditTagsComponent } from '../tags/edit-tags.component';

@Component({
  selector: 'building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css'],
  standalone: true,
  imports: [
    OnboardingMessageComponent,
    NgbNavModule,
    PermissionsDirective,
    NgIf,
    NgbTooltipModule,
    InsufficientPermissionsMessageComponent,
    StickyPopoverDirective,
    EditTagsComponent,
    OutlineModule,
  ],
})
export class BuildingComponent implements OnDestroy {
  private readonly workspaceFacade = inject(WorkspaceFacade);
  private readonly permissionsService = inject(PermissionsService);

  outlineData = signal<NotebitsOutlineData>([]);

  selectedInitiativeId = this.workspaceFacade.selectedInitiativeId;
  expandInitiativeId = signal<number | null>(null);

  // TODO: Using `canSeeOnboardingMessages` as a proxy for all editing
  // permissions, this will need to be reviewed when we bring back more
  // granular permissions
  disableEditing = toSignal(
    this.permissionsService.canSeeOnboardingMessages$.pipe(
      map((value) => !value)
    )
  );

  searched: string;
  nodes: Array<Initiative>;

  eermissions = Permissions;

  @ViewChild('nav', { static: true }) public tabs: NgbNav;

  @ViewChild('deleteConfirmation', { static: true })
  deleteConfirmationModal: NgbModal;
  fromInitiative: Initiative;
  toInitiative: Initiative;

  @ViewChild('dragConfirmation', { static: true })
  dragConfirmationModal: NgbModal;
  initiativeToBeDeleted: Initiative;

  datasetId: string;

  team: Team;
  tags: Tag[];
  isFirstEdit: boolean;
  isExpanding: boolean;
  isCollapsing: boolean;
  isToggling: boolean;

  @Input('user') user: User;
  @Input('isEmptyMap') isEmptyMap: boolean;

  @Output('save') save: EventEmitter<{
    initiative: Initiative;
    tags: Tag[];
  }> = new EventEmitter<{ initiative: Initiative; tags: Tag[] }>();
  @Output('openDetails') openDetails = new EventEmitter<Initiative>();

  private roleAddedSubscription: Subscription;
  private roleEditedSubscription: Subscription;
  private roleDeletedSubscription: Subscription;

  constructor(
    private dataService: DataService,
    private datasetFactory: DatasetFactory,
    private modalService: NgbModal,
    private userFactory: UserFactory,
    private roleLibrary: RoleLibraryService,
    private cd: ChangeDetectorRef,
    private loaderService: LoaderService,
    private circleMapService: CircleMapService,
    private circleMapServiceExpanded: CircleMapServiceExpanded
  ) {
    // this.nodes = [];

    this.roleAddedSubscription = this.roleLibrary.roleAdded.subscribe(
      (addedRole) => {
        this.onLibraryRoleAdd(addedRole);
      }
    );

    this.roleEditedSubscription = this.roleLibrary.roleEdited.subscribe(
      (editedRole) => {
        this.onLibraryRoleEdit(editedRole);
      }
    );

    this.roleDeletedSubscription = this.roleLibrary.roleDeleted.subscribe(
      (deletedRole) => {
        this.onLibraryRoleDelete(deletedRole);
      }
    );
  }

  ngOnDestroy() {
    if (this.roleAddedSubscription) this.roleAddedSubscription.unsubscribe();
    if (this.roleEditedSubscription) this.roleEditedSubscription.unsubscribe();
    if (this.roleDeletedSubscription)
      this.roleDeletedSubscription.unsubscribe();
  }

  saveChanges() {
    this.save.emit({ initiative: this.nodes[0], tags: this.tags });
  }

  state = localStorage.treeState && JSON.parse(localStorage.treeState);
  setState(state: any) {
    localStorage.treeState = JSON.stringify(state);
    this.isCollapsing = false;
    this.isExpanding = false;
    this.isToggling = false;
    this.cd.markForCheck();
  }

  isRootValid(): boolean {
    return (
      this.nodes[0].name !== undefined && this.nodes[0].name.trim().length > 0
    );
  }

  updateTreeModel(treeModel: any) {
    treeModel.update();
  }

  // TODO: Remove this completely when we remove the old outliner
  openNodeDetails(node: Initiative) {
    this.workspaceFacade.setSelectedInitiativeID(node.id);

    // TODO: Connect the sidebar itself to the store and remove this
    this.openDetails.emit(node);
    // TODO: Remove this once we're ready to remove the outine
    this.circleMapService.onInitiativeClickInOutline(node);
    this.circleMapServiceExpanded.onInitiativeClickInOutline(node);
  }

  onEditingTags(tags: Tag[]) {
    this.tags = tags;
    this.nodes[0].traverse((node: Initiative) => {
      node.tags = intersectionBy(tags, node.tags, (t: Tag) => t.shortid);
    });
    this.saveChanges();
  }

  onLibraryRoleAdd(libraryRole: Role) {
    this.saveChanges();
  }

  onLibraryRoleEdit(libraryRole: Role) {
    this.nodes[0].traverse((node: Initiative) => {
      // Select both helpers and the person accountable for the initiative
      const people = node.accountable
        ? node.helpers.concat([node.accountable])
        : node.helpers;

      // Update the role for each person that has it assigned
      people.forEach((helper) => {
        const matchingRole = helper.roles.find(
          (role) => role && role.shortid === libraryRole.shortid
        );
        if (matchingRole) {
          matchingRole.copyContentFrom(libraryRole);
        }
      });
    });

    this.saveChanges();
  }

  onLibraryRoleDelete(libraryRole: Role) {
    this.nodes[0].traverse((node: Initiative) => {
      // Select both helpers and the person accountable for the initiative
      const people = node.accountable
        ? node.helpers.concat([node.accountable])
        : node.helpers;

      // Remove the role for each person that has it assigned
      people.forEach((person) => {
        const matchingRoleIndex = person.roles.findIndex(
          (role) => role && role.shortid === libraryRole.shortid
        );
        if (matchingRoleIndex > -1) {
          person.roles.splice(matchingRoleIndex, 1);
        }
      });
    });

    this.saveChanges();
  }

  onDeleteNode(initiative: Initiative) {
    this.initiativeToBeDeleted = initiative;

    this.modalService
      .open(this.deleteConfirmationModal, { centered: true })
      .result.then((result) => {
        if (result) {
          this.removeNode(initiative);
        }
      })
      .catch();
  }

  private removeNode(node: Initiative) {
    let hasFoundNode = false;

    const index = this.nodes[0].children.findIndex((c) => c.id === node.id);
    if (index > -1) {
      this.nodes[0].children.splice(index, 1);
    } else {
      this.nodes[0].traverse((n) => {
        if (hasFoundNode) return;
        const index = n.children?.findIndex((c) => c.id === node.id);
        if (index > -1) {
          hasFoundNode = true;
          n.children.splice(index, 1);
        }
      });
    }

    this.sendInitiativesToOutliner();
  }

  addNodeTo(node: Initiative, subNode: Initiative) {
    let hasFoundNode = false;
    if (this.nodes[0].id === node.id) {
      hasFoundNode = true;
      const newNode = subNode;
      newNode.children = [];
      newNode.team_id = node.team_id;
      newNode.hasFocus = true;
      newNode.id = Math.floor(Math.random() * 10000000000000);
      this.nodes[0].children = this.nodes[0].children || [];
      this.nodes[0].children.unshift(newNode);
      // this.openDetails.emit(newNode)
    } else {
      this.nodes[0].traverse((n) => {
        if (hasFoundNode) return;
        if (n.id === node.id) {
          hasFoundNode = true;
          const newNode = subNode;
          newNode.children = [];
          newNode.team_id = node.team_id;
          newNode.hasFocus = true;
          newNode.id = Math.floor(Math.random() * 10000000000000);
          n.children = n.children || [];
          n.children.unshift(newNode);
          // this.openDetails.emit(newNode)
        }
      });
    }
  }

  addRootNode() {
    this.addNodeTo(this.nodes[0], new Initiative());
  }

  /**
   * Loads data into workspace
   * @param id Dataset Id
   * @param slugToOpen Slug of initiative to open
   */
  loadData(dataset: DataSet, team: Team, members: User[]): Promise<void> {
    this.loaderService.show();
    this.datasetId = dataset.datasetId;
    this.team = team;
    this.tags = dataset.tags;
    return this.datasetFactory
      .get(dataset.datasetId)
      .then((dataset) => {
        this.nodes = [];
        this.nodes.push(dataset.initiative);

        // Ensure roles within the dataset are synchronised with team roles that might have been updated while
        // editing another dataset
        this.roleLibrary.setRoles(team.roles);
        this.roleLibrary.syncDatasetRoles(dataset.roles, this.nodes[0]);
        dataset.roles = team.roles;

        return this.userFactory.getUsers(team.members.map((m) => m.user_id));
      })
      .then((users: User[]) => {
        // TODO: This is the first place where the initiative and the
        // initiative in the dataset are no longer the same object
        // console.log(this.nodes[0] === dataset.initiative); // false

        const queue = this.nodes[0].traversePromise(
          function (node: Initiative) {
            let q: any = [];
            if (node.accountable) {
              q += new Promise(() => {
                const a = users.find(
                  (u) => u.user_id === node.accountable.user_id
                );
                if (a) {
                  node.accountable.picture = a.picture;
                  node.accountable.name = a.name;
                  node.accountable.shortid = a.shortid;
                }
              });
            }
            if (node.helpers) {
              node.helpers.forEach((helper) => {
                q += new Promise(() => {
                  const h = users.find((u) => u.user_id === helper.user_id);
                  if (h) {
                    helper.picture = h.picture;
                    helper.name = h.name;
                    helper.shortid = h.shortid;
                  }
                });
              });
            }
          }.bind(this)
        );

        return Promise.all(queue)
          .then((t) => t)
          .catch(() => {});
      })
      .then(() => {
        this.prepareOutliner();

        this.dataService.set({
          initiative: this.nodes[0],
          dataset: dataset,
          team: this.team,
          members: members,
        });

        this.cd.markForCheck();
      })
      .then(() => {
        this.loaderService.hide();
      });
  }

  private prepareOutliner() {
    this.sendInitiativesToOutliner();
    this.expandFirstLevelNodes();
  }

  private sendInitiativesToOutliner() {
    this.outlineData.set(
      this.transformNodesIntoOutlineData(this.nodes[0].children)
    );
  }

  private transformNodesIntoOutlineData(nodes): NotebitsOutlineData {
    return nodes.map((node) => {
      console.log('children', node.children);

      const children =
        node.children && node.children.length > 0
          ? this.transformNodesIntoOutlineData(node.children)
          : [];

      return {
        id: node.id,
        value: node.name || '',
        children,
      };
    });
  }

  private expandFirstLevelNodes() {
    this.nodes[0].children.forEach((node) => {
      // TODO: This needs to be done properly, not in this hacky way, see also
      // TODO below in the `expandInitiative` method itelf
      setTimeout(() => {
        this.expandInitiative(node.id);
      });
    });
  }

  onSelectedInitiativeIdChange(selectedInitiativeId: string | null) {
    // TODO: Handle nulls correctly when the time comes, i.e. when the outliner
    // starts sending those
    this.workspaceFacade.setSelectedInitiativeID(Number(selectedInitiativeId));
  }

  onInitiativeEdit({ id: idString, value }: OutlineItemEditEvent) {
    let id = Number(idString);

    const initiative = this.findNodeById(id);
    initiative.name = value;

    // TODO: This only works so simply because of the deal with the devil that
    // was the debounce that I now moved to the notebits outliner. Ideally, we
    // want to propagate the state changes immediately and only run the
    // debounce on the actual call to the API!
    this.saveChanges();
  }

  onInitiativeCreate(parentId: number) {
    const parent = this.findNodeById(parentId);

    const newInitiative = new Initiative();
    newInitiative.id = Math.floor(Math.random() * 10000000000000);
    newInitiative.team_id = parent.team_id;
    newInitiative.hasFocus = true;

    parent.children = parent.children || [];
    parent.children.unshift(newInitiative);

    this.sendInitiativesToOutliner();
    this.expandInitiative(parentId);
    this.workspaceFacade.setSelectedInitiativeID(newInitiative.id);
    this.saveChanges();
  }

  onInitiativeMove(event: OutlineItemMoveEvent) {
    const initiative = this.findNodeById(Number(event.id));

    const oldParent =
      event.oldParentId === null
        ? this.nodes[0]
        : this.findNodeById(Number(event.oldParentId));

    const newParent =
      event.newParentId === null
        ? this.nodes[0]
        : this.findNodeById(Number(event.newParentId));

    const oldIndex = oldParent.children.indexOf(initiative);
    const newIndex = event.newIndex;

    // Move initiative to new parent at given index
    oldParent.children.splice(oldIndex, 1);

    if (newParent.children === undefined) {
      newParent.children = [];
    }

    newParent.children.splice(newIndex, 0, initiative);

    this.sendInitiativesToOutliner();
    this.expandInitiative(newParent.id);
    this.saveChanges();
  }

  onInitiativeDelete(id: number) {
    const initiative = this.findNodeById(id);
    this.onDeleteNode(initiative);
  }

  private findNodeById(id: number): Initiative {
    let nodeFound;

    if (this.nodes[0].id === id) {
      nodeFound = this.nodes[0];
    } else {
      this.nodes[0].traverse((node: Initiative) => {
        if (node.id === id) {
          nodeFound = node;
          return;
        }
      });
    }

    return nodeFound;
  }

  expandInitiative(id: number) {
    // TODO: This should be done differently, by taking the same approach as in
    // the original Angular Material tree probably, namely by using a
    // TreeControl class for directly controlling expansion
    this.expandInitiativeId.set(null);
    this.expandInitiativeId.set(id);
  }
}
