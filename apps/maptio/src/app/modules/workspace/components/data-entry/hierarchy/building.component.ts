import { User } from '../../../../../shared/model/user.data';
import { Team } from '../../../../../shared/model/team.data';
import { Permissions } from '../../../../../shared/model/permission.data';
import { UserFactory } from '../../../../../core/http/user/user.factory';
import { DatasetFactory } from '../../../../../core/http/map/dataset.factory';
import { DataService } from '../../../services/data.service';
import { Initiative } from '../../../../../shared/model/initiative.data';

import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { EventEmitter, OnDestroy } from '@angular/core';
import {
  Component,
  ViewChild,
  Output,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  TreeNode,
  TREE_ACTIONS,
  TreeComponent,
} from '@circlon/angular-tree-component';

import { InitiativeNodeComponent } from '../node/initiative.node.component';
import {
  NgbModal,
  NgbNav,
  NgbNavChangeEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { LoaderService } from '../../../../../shared/components/loading/loader.service';
import { Tag } from '../../../../../shared/model/tag.data';
import { Role } from '../../../../../shared/model/role.data';
import { DataSet } from '../../../../../shared/model/dataset.data';
import { UserService } from '../../../../../shared/services/user/user.service';
import { RoleLibraryService } from '../../../services/role-library.service';
import { CircleMapService } from '@maptio-circle-map/circle-map.service';
import { intersectionBy } from 'lodash';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingComponent implements OnDestroy {
  searched: string;
  nodes: Array<Initiative>;

  options = {
    allowDrag: (node: TreeNode) => node.data.isDraggable,
    allowDrop: (element: any, to: { parent: any; index: number }) => {
      return to.parent.parent !== null;
    },
    nodeClass: (node: TreeNode) => {
      return node.parent && node.isRoot ? 'node-root' : '';
    },
    nodeHeight: 55,
    actionMapping: {
      mouse: {
        dragStart: () => {
          this.cd.detach();
        },
        dragEnd: () => {
          this.cd.reattach();
        },
        drop: (
          tree: any,
          node: TreeNode,
          $event: any,
          { from, to }: { from: TreeNode; to: TreeNode }
        ) => {
          this.fromInitiative = from.data;
          this.toInitiative = to.parent.data;

          if (from.parent.id === to.parent.id) {
            // if simple reordering, we dont ask for confirmation
            this.analytics.eventTrack('Map', {
              action: 'move',
              mode: 'list',
              confirmed: true,
              team: this.team.name,
              teamId: this.team.team_id,
            });
            TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to });
          } else {
            this.modalService
              .open(this.dragConfirmationModal, { centered: true })
              .result.then((result) => {
                if (result) {
                  this.analytics.eventTrack('Map', {
                    action: 'move',
                    mode: 'list',
                    confirmed: true,
                    team: this.team.name,
                    teamId: this.team.team_id,
                  });
                  TREE_ACTIONS.MOVE_NODE(tree, node, $event, {
                    from: from,
                    to: to,
                  });
                } else {
                  this.analytics.eventTrack('Initiative', {
                    action: 'move',
                    mode: 'list',
                    confirm: false,
                    team: this.team.name,
                    teamId: this.team.team_id,
                  });
                }
              })
              .catch((reason) => {});
          }
        },
      },
    },
  };

  SAVING_FREQUENCY = 10;

  Permissions = Permissions;

  @ViewChild('tree') public tree: TreeComponent;
  @ViewChild('nav', { static: true }) public tabs: NgbNav;

  @ViewChild(InitiativeNodeComponent)
  node: InitiativeNodeComponent;

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
    private analytics: Angulartics2Mixpanel,
    private userFactory: UserFactory,
    private userService: UserService,
    private roleLibrary: RoleLibraryService,
    private cd: ChangeDetectorRef,
    private loaderService: LoaderService,
    private circleMapService: CircleMapService
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

    // Open all nodes unless we have saved state
    if (!this.state) {
      this.toggleAll(true);
    }
  }

  ngOnDestroy() {
    if (this.roleAddedSubscription) this.roleAddedSubscription.unsubscribe();
    if (this.roleEditedSubscription) this.roleEditedSubscription.unsubscribe();
    if (this.roleDeletedSubscription)
      this.roleDeletedSubscription.unsubscribe();
  }

  ngAfterViewChecked() {
    try {
      const someNode = this.tree.treeModel.getFirstRoot();
      someNode.expand();
    } catch (e) {}
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

  updateTree() {
    // this will saveChanges() on the callback
    this.tree.treeModel.update();
  }

  openNodeDetails(node: Initiative) {
    this.openDetails.emit(node);
    this.circleMapService.onInitiativeClickInOutline(node);
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

  moveNode(node: Initiative, from: Initiative, to: Initiative) {
    const foundTreeNode = this.tree.treeModel.getNodeById(node.id);
    const foundToNode = this.tree.treeModel.getNodeById(to.id);
    TREE_ACTIONS.MOVE_NODE(
      this.tree.treeModel,
      foundToNode,
      {},
      { from: foundTreeNode, to: { parent: foundToNode } }
    );
  }

  removeNode(node: Initiative) {
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

    this.updateTree();
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

    this.updateTree();
  }

  addRootNode() {
    this.addNodeTo(this.nodes[0], new Initiative());
  }

  toggleAll(isExpand: boolean) {
    if (this.isToggling) return;
    this.isToggling = true;
    this.isExpanding = isExpand === true;
    this.isCollapsing = isExpand === false;
    this.cd.markForCheck();

    setTimeout(() => {
      isExpand
        ? this.tree.treeModel.expandAll()
        : this.tree.treeModel.collapseAll();

      // This is handled in setState already... but that doesn't fire
      // the tree is already expanded, effectively breaking the
      // expand/collapse all buttons - so we repeat this here
      this.isCollapsing = false;
      this.isExpanding = false;
      this.isToggling = false;
      this.cd.markForCheck();
    }, 100);
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
}
