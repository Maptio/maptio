import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  SimpleChanges,
  OnChanges,
} from '@angular/core';

import { User, MemberFormFields } from '@maptio-shared/model/user.data';
import { Team } from '@maptio-shared/model/team.data';
import { Helper } from '@maptio-shared/model/helper.data';

import { CommonAutocompleteComponent } from '@maptio-shared/components/autocomplete/autocomplete.component';


@Component({
  selector: 'maptio-initiative-authority-select',
  templateUrl: './authority-select.component.html',
  // styleUrls: ['./authority-select.component.css']
})
export class InitiativeAuthoritySelectComponent implements OnChanges {
  @Input() team: Team;
  @Input() authority: Helper;
  @Input() isEditMode: boolean;
  @Input() summaryUrlRoot: string;
  @Input() isUnauthorized: boolean;
  @Output() save: EventEmitter<Helper> = new EventEmitter<Helper>();

  placeholder: string;

  newMemberData: MemberFormFields;

  isCreateNewMemberMode = false;

  @ViewChild('autocomplete', { static: true })
  public autocompleteComponent: CommonAutocompleteComponent;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.team && changes.team.currentValue) {
      // this.placeholder = `Who's the ${changes.team.currentValue.settings.authority.toLowerCase()} for this? Enter a team member`
      this.placeholder = 'Start typing the name of a member';
    }
  }

  onSelect(newAccountable: Helper) {
    if (newAccountable && !newAccountable.user_id) {
      this.isCreateNewMemberMode = true;
      return;
    }

    if (newAccountable) newAccountable.roles = [];

    this.authority = newAccountable;
    this.save.emit(this.authority);
  }

  onRemove() {
    this.authority = null;
    this.save.emit(this.authority);
  }

  onCreateNewMember(user: User) {
    this.isCreateNewMemberMode = false;

    const teamMember = this.team.members.find(member => member.user_id === user.user_id);

    if (teamMember) {
      this.onSelect(teamMember as Helper);
    } else {
      console.error('Team member corresponding to created user not found');
    }
  }

  onCancelAddingMember() {
    this.isCreateNewMemberMode = false;
  }

  /**
   * Leave a fat arrow in order to fixate the this and be able to use in child component
   * See : https://stackoverflow.com/a/54169646/7092722
   */
  filterMembers = (term: string) => {
    const filteredTeamMembers = term.length < 1
      ? this.authority
        ? this.team.members.filter((m) => m.user_id !== this.authority.user_id)
        : this.team.members
      : (this.authority
          ? this.team.members.filter(
              (m) => m.user_id !== this.authority.user_id
            )
          : this.team.members
        ).filter(
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

  formatter = (result: User) => {
    return result ? result.name : '';
  };
}
