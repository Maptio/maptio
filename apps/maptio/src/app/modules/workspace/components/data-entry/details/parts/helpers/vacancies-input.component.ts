import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { Initiative } from '../../../../../../../shared/model/initiative.data';
import { Role } from '../../../../../../../shared/model/role.data';
import { RouterLink } from '@angular/router';
import { InitiativeHelperRoleComponent } from './helper-role.component';
import { InitiativeHelperRoleInputComponent } from './helper-role-input.component';
import { InitiativeHelperRoleSelectComponent } from './helper-role-select.component';
import { StickyPopoverDirective } from '../../../../../../../shared/directives/sticky.directive';


@Component({
    selector: 'initiative-vacancies-input',
    templateUrl: './vacancies-input.component.html',
    styleUrls: ['./vacancies-input.component.css'],
    imports: [
    StickyPopoverDirective,
    InitiativeHelperRoleSelectComponent,
    InitiativeHelperRoleInputComponent,
    InitiativeHelperRoleComponent,
    RouterLink
]
})
export class InitiativeVacanciesInputComponent implements OnInit {
  @Input('initiative') initiative: Initiative;
  @Input('summaryUrlRoot') summaryUrlRoot: string;
  @Input('isUnauthorized') isUnauthorized: boolean;

  @Output('save') save: EventEmitter<void> = new EventEmitter<void>();

  cancelClicked: boolean;
  isPickRoleMode = false;
  isCreateRoleMode = false;
  isEditRoleMode = false;

  newRole: Role;
  roleBeingEdited: Role;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.initiative && changes.initiative.currentValue) {
      this.isPickRoleMode = false;

      this.isCreateRoleMode = false;
      this.newRole = undefined;

      this.isEditRoleMode = false;
      this.roleBeingEdited = undefined;
    }
  }

  showVacanciesList() {
    return (
      this.initiative &&
      Array.isArray(this.initiative.vacancies) &&
      this.initiative.vacancies.length
    );
  }

  onPickRole(roles: Role[]) {
    this.isPickRoleMode = false;
    this.initiative.vacancies = this.sortRoles(roles);
    this.save.emit();
    this.cd.markForCheck();
  }

  onCreateRole(newRole: Role) {
    this.isPickRoleMode = false;
    this.isCreateRoleMode = true;
    this.newRole = newRole;
    this.cd.markForCheck();
  }

  onCancelCreatingNewRole() {
    this.isCreateRoleMode = false;
    this.newRole = undefined;
    this.cd.markForCheck();
  }

  onSaveNewRole() {
    this.initiative.vacancies.unshift(this.newRole);
    this.initiative.vacancies = this.sortRoles(this.initiative.vacancies);
    this.isCreateRoleMode = false;
    this.newRole = undefined;
    this.save.emit();
    this.cd.markForCheck();
  }

  onEditRole(role: Role) {
    this.roleBeingEdited = role;
    this.isEditRoleMode = true;
  }

  onCancelEditingRole() {
    this.roleBeingEdited = undefined;
    this.isEditRoleMode = false;
  }

  onChangeRole() {
    this.onCancelEditingRole();
    this.initiative.vacancies = this.sortRoles(this.initiative.vacancies);
    this.save.emit();
    this.cd.markForCheck();
  }

  onRemoveRole(roleToBeRemoved: Role) {
    this.initiative.vacancies = this.initiative.vacancies.filter(
      (role) => role !== roleToBeRemoved
    );
    this.save.emit();
    this.cd.markForCheck();
  }

  sortRoles(roles: Role[]): Role[] {
    return roles.sort((a, b) => {
      // Make sure that roles without titles end up at the bottom of the list
      if (!a.hasTitle() && b.hasTitle()) {
        return 1;
      }

      if (a.hasTitle() && !b.hasTitle()) {
        return -1;
      }

      // Sort the remaining roles by title
      if (a.hasTitle() && b.hasTitle()) {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        if (aTitle > bTitle) {
          return 1;
        }

        if (aTitle < bTitle) {
          return -1;
        }
      }

      return 0;
    });
  }
}
