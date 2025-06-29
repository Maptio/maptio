import {
  Component,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  inject,
  effect,
} from '@angular/core';

import { Subject } from 'rxjs';

import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { remove } from 'lodash-es';

import { environment } from '../../../../../config/environment';
import { Permissions } from '../../../../../shared/model/permission.data';
import { Helper } from '../../../../../shared/model/helper.data';
import { TeamFactory } from '../../../../../core/http/team/team.factory';
import { Team } from '../../../../../shared/model/team.data';
import { DataSet } from '../../../../../shared/model/dataset.data';
import { User } from '../../../../../shared/model/user.data';
import { Tag } from '../../../../../shared/model/tag.data';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { PermissionsService } from '../../../../../shared/services/permissions/permissions.service';
import { InitiativeInputSizeComponent } from './parts/size/input-size.component';
import { InitiativeVacanciesInputComponent } from './parts/helpers/vacancies-input.component';
import { InitiativeHelperInputComponent } from './parts/helpers/helper-input.component';
import { NgTemplateOutlet } from '@angular/common';
import { InitiativeHelpersSelectComponent } from './parts/helpers/helpers-select.component';
import { InitiativeDescriptionTextareaComponent } from './parts/description/description-textarea.component';
import { InitiativeAuthoritySelectComponent } from './parts/authority/authority-select.component';
import { InitiativeListTagsComponent } from './parts/tags/list-tags.component';
import { InsufficientPermissionsMessageComponent } from '../../../../permissions-messages/insufficient-permissions-message.component';
import { InitiativeInputNameComponent } from './parts/name/initiative-input-name.component';
import { OnboardingMessageComponent } from '../../../../onboarding-message/onboarding-message/onboarding-message.component';
import { WorkspaceService } from '../../../../../workspace/workspace.service';

@Component({
  selector: 'initiative',
  templateUrl: './initiative.component.html',
  styleUrls: ['./initiative.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    OnboardingMessageComponent,
    InitiativeInputNameComponent,
    InsufficientPermissionsMessageComponent,
    InitiativeListTagsComponent,
    InitiativeAuthoritySelectComponent,
    InitiativeDescriptionTextareaComponent,
    InitiativeHelpersSelectComponent,
    InitiativeHelperInputComponent,
    NgTemplateOutlet,
    InitiativeVacanciesInputComponent,
    InitiativeInputSizeComponent,
  ],
})
export class InitiativeComponent implements OnChanges {
  @Input() node: Initiative;
  @Input() dataset: DataSet;
  @Input() team: Team;
  @Input() isEditMode: boolean;
  @Input() user: User;

  @Output() edited: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('editTags') editTags: EventEmitter<any> = new EventEmitter<any>();

  public members$: Promise<User[]>;
  public dataset$: Promise<DataSet>;
  public team$: Promise<Team>;
  public authority: string;
  public helper: string;

  isRestrictedAddHelper: boolean;
  hideme: Array<boolean> = [];
  cancelClicked: boolean;
  teamName: string;
  teamId: string;
  Permissions = Permissions;

  @ViewChild('inputDescription') public inputDescriptionElement: ElementRef;
  @ViewChild('inputRole') public inputRoleElement: ElementRef;
  @ViewChild('inputAuthorityRole') public inputAuthorityRole: ElementRef;
  @ViewChild('inputTag') public inputTag: NgbTypeahead;
  @ViewChild(InitiativeInputNameComponent)
  initiativeInputName: InitiativeInputNameComponent;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
  MESSAGE_PERMISSIONS_DENIED_EDIT = environment.MESSAGE_PERMISSIONS_DENIED_EDIT;

  private workspaceService = inject(WorkspaceService);

  constructor(
    private teamFactory: TeamFactory,
    private permissionsService: PermissionsService,
    private cd: ChangeDetectorRef,
  ) {
    // Effect to handle focusing new initiative name
    effect(() => {
      const focusCounter = this.workspaceService.shouldFocusNewInitiativeName();
      if (focusCounter > 0 && this.node?.hasFocus && this.canEditName()) {
        // Activate editing mode and focus the name input
        this.activateNameEditing();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.node && changes.node.currentValue) {
      this.isRestrictedAddHelper = false;
      if (
        changes.node.isFirstChange() ||
        !changes.node.previousValue ||
        changes.node.currentValue.team_id !== changes.node.previousValue.team_id
      ) {
        this.team$ = this.teamFactory
          .get(<string>changes.node.currentValue.team_id)
          .then(
            (t) => {
              this.teamName = t.name;
              this.teamId = t.team_id;
              return t;
            },
            () => {
              return Promise.reject('No organisation available');
            },
          );
      }
    }

    this.cd.markForCheck();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.cd.markForCheck();
  }

  onBlur() {
    this.edited.emit(true);
  }

  canEditName() {
    return this.permissionsService.canEditInitiativeName(this.node);
  }

  canEditAuthority() {
    return this.permissionsService.canEditInitiativeAuthority(this.node);
  }

  canEditDescription() {
    return this.permissionsService.canEditInitiativeDescription(this.node);
  }

  canEditTags() {
    return this.permissionsService.canEditInitiativeTags(this.node);
  }

  canAddHelper() {
    return this.permissionsService.canAddHelper(this.node);
  }

  canEditHelper(helper: Helper) {
    return this.permissionsService.canEditHelper(this.node, helper);
  }

  canEditPrivilege() {
    return this.permissionsService.canGiveHelperPrivilege(this.node);
  }

  canEditVacancies() {
    return this.permissionsService.canEditVacancies();
  }

  canEditSize() {
    return this.permissionsService.canEditSize();
  }

  saveName(newName: string) {
    this.node.name = newName;
    this.onBlur();
    this.cd.markForCheck();
  }

  saveTags(newTags: Array<Tag>) {
    this.node.tags = newTags;
    this.onBlur();
    this.cd.markForCheck();
  }

  /**
   * Deal with roles and helpers when saving accountable
   *
   * 0. No authority passed in, remove current authority, if any
   * 1. If the circle already had an authority, the authority's roles will be
   *    passed on to the new authority
   * 2. If a helper is picked as authority, keep the helper's roles, add
   *    the current authority's roles too, if any (see point 1), and remove
   *    helper from the helpers list (as they will already appear there as an
   *    authority)
   */
  saveAccountable(accountable: Helper) {
    if (!accountable) {
      this.node.accountable = null;
    } else {
      let oldAccountableRoles = [];
      if (this.node.accountable) {
        oldAccountableRoles = this.node.accountable.roles;
      }

      if (this.isHelper(accountable)) {
        const helper = this.getHelper(accountable);
        this.removeHelper(helper, false);

        // Assign helper along with their roles as the accountable
        this.node.accountable = helper;
      } else {
        this.node.accountable = accountable;
      }

      if (oldAccountableRoles) {
        this.node.accountable.roles = oldAccountableRoles.concat(
          this.node.accountable.roles,
        );
      }
    }

    this.onBlur();
    this.cd.markForCheck();
  }

  saveDescription(newDesc: string) {
    this.node.description = newDesc;
    this.onBlur();
  }

  addHelpers(helpers: Helper[]) {
    this.node.helpers = helpers;
    this.onBlur();
    this.cd.markForCheck();
  }

  removeHelper(helper: Helper, save = true) {
    if (this.isAuthority(helper)) {
      this.saveAccountable(undefined);
      return;
    }

    const index = this.node.helpers.findIndex(
      (user) => user.user_id === helper.user_id,
    );
    this.node.helpers.splice(index, 1);

    if (save) {
      this.onBlur();
      this.cd.markForCheck();
    }
  }

  saveHelpers() {
    this.onBlur();
  }

  saveVacancies() {
    this.onBlur();
  }

  saveSize(newSize: number) {
    this.node.sizeAdjustment = newSize;
    this.onBlur();
    this.cd.markForCheck();
  }

  getSummaryUrlRoot() {
    return `/map/${
      this.dataset.datasetId
    }/${this.dataset.initiative.getSlug()}/directory`;
  }

  openTagsPanel() {
    this.editTags.emit();
  }

  trackByUserId(index: number, helper: Helper) {
    return helper.user_id;
  }

  toggleRole(i: number) {
    this.hideme.forEach((el) => {
      el = true;
    });
    this.hideme[i] = !this.hideme[i];
  }

  getAllHelpers() {
    return remove([...this.node.helpers, this.node.accountable].reverse()); // always disaply the authority first
  }

  getHelper(potentialHelper: Helper) {
    return this.node.helpers.find(
      (helperInList) => helperInList.user_id === potentialHelper.user_id,
    );
  }

  isHelper(potentialHelper: Helper) {
    return !!this.getHelper(potentialHelper);
  }

  isAuthority(helper: Helper) {
    return (
      this.node.accountable && this.node.accountable.user_id === helper.user_id
    );
  }

  activateNameEditing() {
    this.isEditMode = true;
    this.cd.markForCheck();

    // Use setTimeout to ensure the DOM is updated before activating editing
    setTimeout(() => {
      if (this.initiativeInputName) {
        this.initiativeInputName.activateEditing();
      }
    });
  }
}
