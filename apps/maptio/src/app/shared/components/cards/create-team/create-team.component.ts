import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Team } from '../../../model/team.data';
import { User } from '../../../model/user.data';
import { Permissions } from '../../../model/permission.data';
import { TeamService } from '../../../services/team/team.service';

@Component({
  selector: 'maptio-create-team',
  templateUrl: './create-team.component.html',
})
export class CreateTeamComponent implements OnInit {
  createForm: FormGroup;
  isCreating: boolean;
  errorMessage: string;

  Permissions = Permissions;

  @Input() user: User;

  constructor(
    private teamService: TeamService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.createForm = new FormGroup({
      teamName: new FormControl('', {
        validators: [Validators.required, Validators.minLength(2)],
        updateOn: 'submit',
      }),
    });
  }

  createNewTeam() {
    this.errorMessage = '';

    if (this.createForm.dirty && this.createForm.valid) {
      const teamName = this.createForm.controls['teamName'].value;
      this.isCreating = true;

      try {
        this.teamService
          .create(teamName, this.user)
          .then((team: Team) => {
            this.router.navigate([
              'teams',
              team.team_id,
              team.getSlug(),
              'maps',
            ]);
            this.isCreating = false;
          })
          .catch((error) => {
            this.errorMessage = error;
            this.isCreating = false;
            this.cd.markForCheck();
          });
      } catch (error) {
        this.errorMessage = error;
        this.isCreating = false;
        this.cd.markForCheck();
      }
    }
  }
}
