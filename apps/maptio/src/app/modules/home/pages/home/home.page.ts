import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { Store } from '@ngrx/store';

import { SubSink } from 'subsink';
import { isEmpty } from 'lodash-es';

import { environment } from '@maptio-config/environment';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { EmitterService } from '@maptio-core/services/emitter.service';
import { AppState } from '@maptio-state/app.state';
import { setCurrentOrganisationId } from '@maptio-state/global.actions';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';
import { OnboardingService } from '@maptio-shared/components/onboarding/onboarding.service';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';
import { LoginRedirectDirective } from '../../../login/login-redirect/login-redirect.directive';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'maptio-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.css'],
    imports: [
    DashboardComponent,
    LoginRedirectDirective,
    AsyncPipe,
    SafePipe
]
})
export class HomeComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  public datasets: DataSet[];
  public teams: Team[];
  public user: User;

  public isLoading: boolean;
  public isOnboarding: boolean;

  SCREENSHOT_URL = environment.SCREENSHOT_URL;
  SCREENSHOT_URL_FALLBACK = environment.SCREENSHOT_URL_FALLBACK;

  constructor(
    private cd: ChangeDetectorRef,
    private store: Store<AppState>,
    public datasetFactory: DatasetFactory,
    public teamFactory: TeamFactory,
    public userService: UserService,
    public loaderService: LoaderService,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit(): void {
    // TODO: This can be written much more cleanly!
    this.subs.sink = this.userService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        if (isAuthenticated) {
          this.loaderService.show();
          this.isLoading = true;
          this.isOnboarding = true;
          this.cd.markForCheck();

          this.subs.sink = this.userService.userWithTeamsAndDatasets$.subscribe(
            (data: { datasets: DataSet[]; teams: Team[]; user: User }) => {
              if (!data) return;

              this.teams = data.teams;
              this.datasets = data.datasets;
              this.user = data.user;

              this.isLoading = false;

              this.isOnboarding = isEmpty(this.teams);
              if (this.isOnboarding) {
                this.onboardingService.open(this.user);
              }

              // TODO: Move this to ngrx state too
              EmitterService.get('currentTeam').emit(this.teams[0]);

              const currentOrganisationId = this.teams[0]?.team_id;
              this.store.dispatch(
                setCurrentOrganisationId({ currentOrganisationId })
              );

              this.cd.markForCheck();
              this.loaderService.hide();
            }
          );
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
