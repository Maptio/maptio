import { environment } from '../../../../config/environment';
import { Subscription } from 'rxjs';
import { Permissions } from '../../../../shared/model/permission.data';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  Renderer2,
} from '@angular/core';
import { User } from '../../../../shared/model/user.data';
import { Team } from '../../../../shared/model/team.data';
import { Router, ActivatedRoute } from '@angular/router';
import { isEmpty } from 'lodash';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { UserService } from '@maptio-shared/services/user/user.service';

@Component({
  selector: 'team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list-component.css'],
})
export class TeamListComponent implements OnInit {
  public user: User;
  public userSubscription: Subscription;
  public routeSubscription: Subscription;
  public teams: Array<Team>;
  public errorMessage: string;
  public cannotCreateMoreTeamMessage: string;
  public isCreating: boolean;

  public createForm: FormGroup;
  public teamName: string;
  public teamsNumber: number;
  public isZeroTeam: boolean;
  public isRedirectHome: boolean;

  Permissions = Permissions;
  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    public userService: UserService,
    public router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loaderService.show();
    this.routeSubscription = this.route.data.subscribe((data: any) => {
      this.teams = data.teams;
      this.isZeroTeam = isEmpty(this.teams);
      this.teamsNumber = data.teams.length;
      this.cd.markForCheck();
      this.loaderService.hide();
    });

    this.isRedirectHome = this.route.snapshot.queryParamMap.has('onboarding');
    this.userSubscription = this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }

  canCreateUnlimitedTeams() {
    return this.userService
      .getPermissions()
      .includes(Permissions.canCreateUnlimitedTeams);
  }

  trackByTeamId(index: number, team: Team) {
    return team.team_id;
  }
}
