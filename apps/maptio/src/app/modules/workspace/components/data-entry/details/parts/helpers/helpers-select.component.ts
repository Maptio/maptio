import {
  Component,
  Input,
  Output,
  ChangeDetectorRef,
  SimpleChanges,
  EventEmitter,
  OnChanges,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash-es';

import { Team } from '@maptio-shared/model/team.data';
import { Helper } from '@maptio-shared/model/helper.data';
import { Auth } from '@maptio-core/authentication/auth.service';
import { User, MemberFormFields } from '@maptio-shared/model/user.data';


@Component({
  selector: 'maptio-initiative-helpers-select',
  templateUrl: './helpers-select.component.html',
  // styleUrls: ['./helpers-select.component.css']
})
export class InitiativeHelpersSelectComponent implements OnChanges {
  @Input() team: Team;
  @Input() helpers: Helper[];
  @Input() user: User;
  @Input() authority: Helper;
  @Input() isEditMode: boolean;
  @Input() isUnauthorized: boolean;

  @Output() save: EventEmitter<Array<Helper>> = new EventEmitter<Array<Helper>>();
  @Output() createNewMember: EventEmitter<boolean> = new EventEmitter();

  placeholder: string;
  subscription: Subscription;

  newMemberData: MemberFormFields;

  isLoaded: boolean;
  isCreateNewMemberMode = false;

  constructor(private auth: Auth, private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.team && changes.team.currentValue) {
      this.placeholder = `Start typing the name of a ${(changes.team
        .currentValue as Team).settings.helper.toLowerCase()}`;
    }
    this.cd.markForCheck();
  }

  isCurrentUserAlreadyAdded() {
    if (this.helpers && this.user) {
      return (
        this.helpers
          .concat([this.authority])
          .filter((h) => !!h)
          .findIndex((h) => h.user_id === this.user.user_id) > -1
      );
    }
    this.cd.markForCheck();
  }

  onAddingHelper(newHelper: Helper) {
    if (!Object.prototype.hasOwnProperty.call(newHelper, 'user_id')) {
      this.isCreateNewMemberMode = true;
      return;
    }

    if (
      (this.authority && newHelper.user_id === this.authority.user_id) ||
      this.helpers.findIndex((user) => user.user_id === newHelper.user_id) > 0
    ) {
      return;
    }
    if (this.helpers.findIndex((h) => h.user_id === newHelper.user_id) > -1) {
      return;
    }

    // Create a copy to avoid adding the same object to multiple initiative
    // and overwriting roles across initiatives
    const helperCopy = cloneDeep(newHelper);
    helperCopy.roles = [];

    this.helpers.unshift(helperCopy);

    this.save.emit(this.helpers);
    this.cd.markForCheck();
  }

  onAddingCurrentUser() {
    this.onAddingHelper(this.user as Helper);
  }

  onCreateNewMember(user: User) {
    this.isCreateNewMemberMode = false;

    const teamMember = this.team.members.find(member => member.user_id === user.user_id);

    if (teamMember) {
      this.onAddingHelper(teamMember as Helper);
    } else {
      console.error('Team member corresponding to created user not found');
    }
  }

  onCancelAddingMember() {
    this.isCreateNewMemberMode = false;
  }

  formatter = (result: Helper) => {
    return result ? result.name : '';
  };

  /**
   * Leave a fat arrow in order to fixate the this and be able to use in child component
   * See : https://stackoverflow.com/a/54169646/7092722
   */
  filterMembers = (term: string) => {
    const filteredTeamMembers = term.length < 1
      ? this.team.members
      : this.team.members.filter(
          (v) =>
            new RegExp(term, 'gi').test(v.name) ||
            new RegExp(term, 'gi').test(v.email)
        );

    this.newMemberData = {
      firstname: term,
      lastname: '',
      email: '',
    }

    return [this.newMemberData, ...filteredTeamMembers];
  };
}
