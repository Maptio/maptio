import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';

import { from, partition } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { SubSink } from 'subsink';

import { environment } from '@maptio-config/environment';

import { User } from '@maptio-shared/model/user.data';
import { Team } from '@maptio-shared/model/team.data';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { ErrorService } from '@maptio-shared/services/error/error.service';
import { BillingService } from '@maptio-shared/services/billing/billing.service';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';
import { OnboardingService } from '@maptio-shared/components/onboarding/onboarding.service';

// import { Auth } from '../authentication/auth.service';
import { DatasetFactory } from '../http/map/dataset.factory';
import { TeamFactory } from '../http/team/team.factory';
import { EmitterService } from '../services/emitter.service';


@Component({
  selector: 'maptio-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();

  public user: User;

  public datasets: Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  public teams: Array<Team>;
  public sampleTeams: Team[];
  public team: Team;
  public selectedDataset: DataSet;
  public areMapsAvailable: Promise<boolean>;
  public isMenuOpened = false;
  public BLOG_URL: string = environment.BLOG_URL;

  public isSaving = false;
  public isSandbox: boolean;

  constructor(
    // public auth: Auth,
    public userService: UserService,
    private datasetFactory: DatasetFactory,
    private teamFactory: TeamFactory,
    public errorService: ErrorService,
    private router: Router,
    public loaderService: LoaderService,
    private cd: ChangeDetectorRef,
    private billingService: BillingService,
    private onboarding: OnboardingService
  ) {
    const [teamDefined, teamUndefined] = partition(
      from(EmitterService.get('currentTeam')),
      (team: Team) => !!team
    );

    this.subs.sink = teamDefined
      .pipe(
        mergeMap((team: Team) => {
          return this.billingService.getTeamStatus(team).pipe(
            map(
              (value: {
                created_at: Date;
                freeTrialLength: Number; // eslint-disable-line @typescript-eslint/ban-types
                isPaying: Boolean; // eslint-disable-line @typescript-eslint/ban-types
              }) => {
                team.createdAt = value.created_at;
                team.freeTrialLength = value.freeTrialLength;
                team.isPaying = value.isPaying;
                return team;
              }
            )
          );
        })
      )
      .subscribe((value: Team) => {
        this.team = value;
        this.cd.markForCheck();
      });

    this.subs.sink = teamUndefined.subscribe((value: Team) => {
      this.team = value;
      this.cd.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.cd.markForCheck();
    document.querySelectorAll('.nav-item.d-none.d-md-block');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onMenuClick() {
    const toggler = document.querySelector(
      '.navbar-toggler'
    ) as HTMLButtonElement;
    if (window.getComputedStyle(toggler).display === 'none') return;
    toggler.click();
  }

  ngOnInit() {
    this.subs.sink = this.userService.userWithTeamsAndDatasets$.subscribe(
      (data: { datasets: DataSet[]; teams: Team[]; user: User }) => {
        if (!data) return;

        this.user = data.user;
        this.datasets = data.datasets;
        this.teams = data.teams.filter((t) => !t.isExample);
        this.sampleTeams = data.teams.filter((t) => t.isExample);
        this.isSandbox =
          this.sampleTeams.length >= 1 && this.teams.length === 0;

        this.cd.markForCheck();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => {
        console.error(error);
      }
    );
  }

  isSignUp() {
    return (
      this.router.url.startsWith('/login') ||
      this.router.url.startsWith('/signup') ||
      this.router.url.startsWith('/forgot')
    );
  }

  isMap() {
    return this.router.url.startsWith('/map');
  }

  isHome() {
    return this.router.url.startsWith('/home');
  }

  isTeam() {
    return this.router.url.startsWith('/teams');
  }

  isPricing() {
    return this.router.url.startsWith('/pricing');
  }

  openOnboarding() {
    this.onboarding.open(this.user);
  }
}
