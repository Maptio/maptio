import {
  Component,
  EventEmitter,
  OnInit,
  Renderer2,
  Input,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Team } from '../../../model/team.data';
import { User } from '../../../model/user.data';
import { Router } from '@angular/router';
import { Permissions } from '../../../model/permission.data';
import { TeamService } from '../../../services/team/team.service';

@Component({
  selector: 'maptio-create-team',
  templateUrl: './create-team.component.html',
})
export class CreateTeamComponent implements OnInit {
  createForm: FormGroup;
  isCreating: boolean;
  cannotCreateMoreTeamMessage: string;
  Permissions = Permissions;

  @Input() existingTeamCount: number;
  @Input() user: User;
  @Input() isRedirectHome: boolean;

  @Output() create: EventEmitter<Team> = new EventEmitter<Team>();
  @Output() errorMessage: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private renderer: Renderer2,
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
    if (this.existingTeamCount >= 1) {
      this.cannotCreateMoreTeamMessage =
        'You have reached your maximum number of teams allowed: 1. Please reach out at support@maptio.com if you need to change these settings.';
    } else {
      if (this.createForm.dirty && this.createForm.valid) {
        const teamName = this.createForm.controls['teamName'].value;
        this.isCreating = true;
        this.teamService
          .create(teamName, this.user)
          .then((team: Team) => {
            if (this.isRedirectHome) {
              this.router.navigateByUrl('/home');
            } else {
              this.router.navigate([
                'teams',
                team.team_id,
                team.getSlug(),
                'maps',
              ]);
            }
            this.isCreating = false;
          })
          .catch((error) => {
            this.errorMessage.emit(error);
            this.isCreating = false;
            this.cd.markForCheck();
          });
      }
    }
  }
}
