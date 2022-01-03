import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { forkJoin as observableForkJoin, Subscription } from 'rxjs';
import { map, mergeMap, } from 'rxjs/operators';

import { sortBy, isEmpty } from 'lodash-es';

import { environment } from '@maptio-config/environment';
import { Auth } from '@maptio-core/authentication/auth.service';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { EmitterService } from '@maptio-core/services/emitter.service';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';
import { InstructionsService } from '@maptio-shared/components/instructions/instructions.service';


@Component({
  selector: 'maptio-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private routeSubscription: Subscription;
  public datasets: DataSet[];
  public teams: Team[];
  public user: User;
  public isLoading: boolean;
  public isOnboarding: boolean;
  SCREENSHOT_URL = environment.SCREENSHOT_URL;
  SCREENSHOT_URL_FALLBACK = environment.SCREENSHOT_URL_FALLBACK;

  constructor(
    public auth: Auth,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    public datasetFactory: DatasetFactory,
    public teamFactory: TeamFactory,
    public loaderService: LoaderService,
    private instructions: InstructionsService
  ) {}

  ngOnInit(): void {
    if (!this.auth.allAuthenticated()) return;
    this.loaderService.show();
    this.isLoading = true;
    this.isOnboarding = true;
    this.cd.markForCheck();
    this.routeSubscription = this.auth
      .getUser()
      .pipe(
        mergeMap((user: User) => {
          return observableForkJoin(
            isEmpty(user.datasets)
              ? Promise.resolve([])
              : this.datasetFactory.get(user.datasets, false),
            isEmpty(user.teams)
              ? Promise.resolve([])
              : this.teamFactory.get(user.teams),
            Promise.resolve(user)
          );
        }),
        map(([datasets, teams, user]: [DataSet[], Team[], User]) => {
          return [
            datasets
              .filter((d) => !d.isArchived)
              .map((d) => {
                d.team = teams.find((t) => d.initiative.team_id === t.team_id);
                return d;
              }),
            teams,
            user,
          ];
        }),
        map(([datasets, teams, user]: [DataSet[], Team[], User]) => {
          return {
            datasets: sortBy(datasets, (d) => d.initiative.name),
            teams: teams,
            user: user,
          };
        })
      )
      .subscribe((data: { datasets: DataSet[]; teams: Team[]; user: User }) => {
        this.teams = data.teams;
        this.datasets = data.datasets;
        this.user = data.user;
        this.isLoading = false;
        if (isEmpty(this.teams)) {
          this.instructions.openWelcome(this.user);
        }
        EmitterService.get('currentTeam').emit(this.teams[0]);
        this.isOnboarding = isEmpty(this.user.teams);
        this.cd.markForCheck();
        this.loaderService.hide();
      });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}
