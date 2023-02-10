import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Team } from '../../../model/team.data';
import { DataSet } from '../../../model/dataset.data';
import { Router } from '@angular/router';
import { Intercom } from 'ng-intercom';
import { MapService } from '../../../services/map/map.service';
import { environment } from '../../../../config/environment';

import { User } from '@maptio-shared/model/user.data';
import { Permissions, UserRole } from '@maptio-shared/model/permission.data';

@Component({
  selector: 'common-create-map',
  templateUrl: './create-map.component.html',
  styleUrls: ['./create-map.component.css'],
})
export class CreateMapComponent implements OnInit {
  form: UntypedFormGroup;
  isCreatingMap: boolean;
  Permissions = Permissions;

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  @Input() user: User;
  @Input() teams: Team[];
  @Input() isRedirect: boolean;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<DataSet>();

  teamsWithAdminRole: Team[];

  constructor(
    private mapService: MapService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private intercom: Intercom
  ) {}

  ngOnInit(): void {
    this.teamsWithAdminRole = this.filterOutNonAdminTeams(this.teams);

    this.form = new UntypedFormGroup({
      mapName: new UntypedFormControl('', {
        validators: [Validators.required, Validators.minLength(2)],
        updateOn: 'submit',
      }),
      teamId: new UntypedFormControl(
        this.teamsWithAdminRole.length == 0
          ? null
          : this.teamsWithAdminRole.length > 1
          ? null
          : this.teamsWithAdminRole[0].team_id,
        [Validators.required]
      ),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.teams && changes.teams.currentValue) {
      this.teams = changes.teams.currentValue.filter((t: Team) => !t.isExample);
      this.teamsWithAdminRole = this.filterOutNonAdminTeams(this.teams);
    }
  }

  /**
   * Returns only teams where the user has an admin role
   *
   * TODO: This should probably look for the map creation permissions instead
   */
  private filterOutNonAdminTeams(teams: Team[]): Team[] {
    return teams.filter((team) => {
      return (
        this.user.getUserRoleInOrganization(team.team_id) === UserRole.Admin
      );
    });
  }

  submit() {
    if (this.form.valid) {
      this.isCreatingMap = true;
      const mapName = this.form.controls['mapName'].value;
      const teamId = this.form.controls['teamId'].value;

      this.mapService
        .createTemplate(mapName, teamId)
        .then((created: DataSet) => {
          return created;
        })
        .then((created) => {
          this.intercom.trackEvent('Create map', {
            teamId: teamId,
            mapName: mapName,
          });
          return created;
        })
        .then((created) => {
          if (this.isRedirect) {
            this.router.navigate([
              'map',
              created.datasetId,
              created.initiative.getSlug(),
            ]);
          } else {
            this.created.emit(created);
            this.form.reset();
            this.cd.markForCheck();
            this.isCreatingMap = false;
          }
        })
        .catch(() => {});
    }
  }
}
