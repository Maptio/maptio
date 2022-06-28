import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Team } from '../../model/team.data';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { User } from '../../model/user.data';
import { DatasetFactory } from '../../../core/http/map/dataset.factory';
import { DataSet } from '../../model/dataset.data';
import { UserFactory } from '../../../core/http/user/user.factory';
import { TeamFactory } from '../../../core/http/team/team.factory';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { Intercom } from 'ng-intercom';
import { TeamService } from '../../services/team/team.service';

@Component({
  selector: 'onboarding-add-terminology',
  templateUrl: './add-terminology.component.html',
})
export class AddTerminologyComponent implements OnInit {
  form: FormGroup;
  isAdded: boolean;
  isAdding: boolean;
  errorMessage: string;

  @Input('team') team: Team;
  @Output('error') error: EventEmitter<string> = new EventEmitter<string>();
  @Output('saved') added: EventEmitter<Team> = new EventEmitter<Team>();

  constructor(
    private teamService: TeamService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      authority: new FormControl(this.team.settings.authority, {
        validators: [Validators.required],
        updateOn: 'change',
      }),
      helper: new FormControl(this.team.settings.helper, {
        validators: [Validators.required],
        updateOn: 'change',
      }),
    });
  }

  isInvalid(formControlName: string) {
    return (
      this.form.controls[formControlName].invalid &&
      (this.form.controls[formControlName].dirty ||
        this.form.controls[formControlName].touched)
    );
  }

  add() {
    if (this.form.valid) {
      this.isAdding = true;
      this.isAdded = false;
      this.errorMessage = null;
      this.cd.markForCheck();
      let authority = this.form.controls['authority'].value;
      let helper = this.form.controls['helper'].value;

      return this.teamService
        .saveTerminology(this.team, this.team.name, authority, helper)
        .then((team: Team) => {
          this.added.emit(team);
          this.isAdding = false;
          this.isAdded = true;
          this.cd.markForCheck();
        })
        .catch((reason) => {
          this.error.emit(reason);
          this.isAdding = false;
          this.isAdded = false;
          this.errorMessage = reason;
          this.cd.markForCheck();
          console.error(reason);
          throw Error(reason);
        });
    }
  }
}
