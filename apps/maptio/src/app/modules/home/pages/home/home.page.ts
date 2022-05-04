import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { SubSink } from 'subsink';
import { isEmpty } from 'lodash-es';

import { environment } from '@maptio-config/environment';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { EmitterService } from '@maptio-core/services/emitter.service';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';
import { OnboardingService } from '@maptio-shared/components/onboarding/onboarding.service';


@Component({
  selector: 'maptio-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
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
    public datasetFactory: DatasetFactory,
    public teamFactory: TeamFactory,
    public userService: UserService,
    public loaderService: LoaderService,
    private onboardingService: OnboardingService,
  ) {}

  ngOnInit(): void {
    // TODO: This can be written much more cleanly!
    this.subs.sink = this.userService.isAuthenticated$.subscribe((isAuthenticated) => {
      if(isAuthenticated) {
        this.loaderService.show();
        this.isLoading = true;
        this.isOnboarding = true;
        this.cd.markForCheck();

        this.subs.sink = this.userService.userWithTeamsAndDatasets$
          .subscribe((data: { datasets: DataSet[]; teams: Team[]; user: User }) => {
            if (!data) return;

            this.teams = data.teams;
            this.datasets = data.datasets;
            this.user = data.user;

            this.isLoading = false;

            this.isOnboarding = isEmpty(this.teams);
            if (this.isOnboarding) {
              this.onboardingService.open(this.user);
            }

            EmitterService.get('currentTeam').emit(this.teams[0]);

            this.cd.markForCheck();
            this.loaderService.hide();
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
