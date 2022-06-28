import { User } from '../../../../../shared/model/user.data';
import { Helper } from '../../../../../shared/model/helper.data';
import { environment } from '../../../../../config/environment';
import { Team } from '../../../../../shared/model/team.data';
import {
  Permissions,
  UserRole,
} from '../../../../../shared/model/permission.data';
import { InitiativeComponent } from '../details/initiative.component';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectorRef,
  TemplateRef,
  Renderer2,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import { TreeNode, TreeModel } from '@circlon/angular-tree-component';

@Component({
  selector: 'initiative-node',
  templateUrl: './initiative.node.component.html',
  styleUrls: ['./initiative.node.component.css'],
})
export class InitiativeNodeComponent {
  PLACEMENT = 'top';
  TOGGLE = 'tooltip';
  TOOLTIP_ADD = 'Add sub-circle';
  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  @Input() node: TreeNode;
  @Input() datasetId: string;
  @Input('team') team: Team;
  @Input('user') user: User;

  @Output('edited') edited = new EventEmitter<boolean>();
  @Output('update') updateTreeEvent = new EventEmitter<TreeModel>();
  @Output('open') open = new EventEmitter<Initiative>();
  @Output('add') add = new EventEmitter<Initiative>();
  @Output() delete = new EventEmitter<Initiative>();

  @ViewChild('initiative') editInitiative: InitiativeComponent;

  Permissions = Permissions;
  teamName: string;
  teamId: string;
  authority: string;
  helper: string;
  isDeleteWarningToggled: boolean;
  isMoveWarningToggled: boolean;
  isEditWarningToggled: boolean;

  private snapshotRoute: ActivatedRouteSnapshot;
  isMovingToggled: boolean;

  constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {
    this.snapshotRoute = route.snapshot;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.team && changes.team.currentValue) {
      this.teamName = changes.team.currentValue.name;
      this.teamId = changes.team.currentValue.team_id;
      this.authority = changes.team.currentValue.settings.authority;
      this.helper = changes.team.currentValue.settings.helper;
    }
    if (changes.user && changes.user.currentValue) {
      this.user = changes.user.currentValue;
    }
  }

  isRoot(): boolean {
    return this.node.parent && this.node.isRoot;
  }

  isDraggable() {
    return this.node.data.isDraggable;
  }

  isFirstLevel() {
    return this.node.parent.isRoot;
  }

  hasChildren(): boolean {
    return this.node.hasChildren;
  }

  isExpanded(): boolean {
    return this.node.isExpanded;
  }

  toggleNode(initiative: Initiative) {
    this.node.treeModel.getNodeById(initiative.id).toggleExpanded();
  }

  saveNodeName(newName: any, initiative: Initiative) {
    initiative.name = newName;
    this.edited.emit(true);
  }

  addChildNode(initiative: Initiative) {
    const treeNode = this.node.treeModel.getNodeById(initiative.id);
    const newNode = new Initiative();
    newNode.children = [];
    newNode.team_id = initiative.team_id;
    newNode.hasFocus = true;
    if (this.user.userRole === UserRole.Standard) {
      const helper = <Helper>this.user;
      helper.roles = [];
      helper.hasAuthorityPrivileges = true;
      newNode.helpers.push(helper);
    }
    setTimeout(() => {
      newNode.hasFocus = false;
    });
    treeNode.data.children = treeNode.data.children || [];
    treeNode.data.children.unshift(newNode);
    this.node.treeModel.setExpandedNode(treeNode, true);
    this.updateTreeEvent.emit(this.node.treeModel);
    this.edited.emit(true);
    this.add.emit(newNode);
  }

  onDeleteNode(initiative: Initiative) {
    this.delete.emit(initiative);
  }

  openNode(node: Initiative) {
    this.open.emit(node);
  }
}
