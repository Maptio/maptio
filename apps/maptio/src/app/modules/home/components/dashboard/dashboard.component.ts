import { debounceTime } from 'rxjs/operators';
import {
  Component,
  ChangeDetectorRef,
  SimpleChanges,
  Input,
} from '@angular/core';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Team } from '../../../../shared/model/team.data';
import { User } from '../../../../shared/model/user.data';
import { Subject, Subscription } from 'rxjs';
import { TeamService } from '../../../../shared/services/team/team.service';
import { MapService } from '../../../../shared/services/map/map.service';
import { OnboardingService } from '../../../../shared/components/onboarding/onboarding.service';
import { environment } from '../../../../config/environment';
import { UserService } from '@maptio-shared/services/user/user.service';
import { CreateTeamComponent } from '../../../../shared/components/cards/create-team/create-team.component';
import { CreateMapComponent } from '../../../../shared/components/cards/create-map/create-map.component';
import { MapCardComponent } from '../../../../shared/components/cards/map/map-card.component';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    MapCardComponent,
    NgTemplateOutlet,
    CreateMapComponent,
    CreateTeamComponent,
  ],
})
export class DashboardComponent {
  @Input('datasets') datasets: DataSet[];
  @Input('teams') teams: Team[];
  @Input('user') user: User;

  areTeamsCreated: boolean;
  areMapsCreated: boolean;
  mapsCount: number;
  teamsCount: number;
  // isOnboarding: boolean;
  isOutOfSampleMode: boolean;
  filterMaps$: Subject<string>;
  filteredMaps: Map<Team, DataSet[]>;
  KB_URL_HOME = environment.KB_URL_HOME;
  subscription: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private teamService: TeamService,
    private mapService: MapService,
    private onboarding: OnboardingService
  ) {
    this.filterMaps$ = new Subject<string>();
  }

  private _teams: Team[] = [];
  private _nonExampleTeams: Team[];
  private _datasets: DataSet[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.datasets && changes.datasets.currentValue) {
      this._datasets = changes.datasets.currentValue;
      this.mapsCount = this._datasets.filter((d) => !d.team.isExample).length;
      this.filterMaps$.next('');
      this.cd.markForCheck();
    }

    if (changes.teams && changes.teams.currentValue) {
      this._teams = changes.teams.currentValue;
      this._nonExampleTeams = this._teams.filter((t) => !t.isExample);
      this.teamsCount = this._teams.length;
    }
  }

  ngOnInit() {
    this.isOutOfSampleMode =
      this._teams.filter((t) => !t.isExample).length >= 1; //&& this.teams.filter(t=> t.isExample).length>=1;
    this.cd.markForCheck();

    this.filteredMaps = this.breakdown([].concat(this._datasets));
    this.subscription = this.filterMaps$
      .asObservable()
      .pipe(debounceTime(250))
      .subscribe((search) => {
        const filtered =
          search === ''
            ? [].concat(this._datasets)
            : this._datasets.filter(
                (d) =>
                  d.initiative.name
                    .toLowerCase()
                    .indexOf(search.toLowerCase()) >= 0 ||
                  d.team.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
              );

        this.filteredMaps = this.breakdown(filtered);

        this.cd.markForCheck();
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    // EmitterService.get("currentTeam").emit(null);
  }

  breakdown(datasets: DataSet[]): Map<Team, DataSet[]> {
    const a = datasets
      .map((d, i, arr) => {
        return <[Team, DataSet[]]>[
          d.team,
          arr.filter((a) => a.team.team_id === d.team.team_id),
        ];
      })
      .sort(function (a, b) {
        if (a[0].name < b[0].name) {
          return -1;
        }
        if (a[0].name > b[0].name) {
          return 1;
        }
        return 0;
      });
    return new Map(a);
  }

  trackByTeamId(index: number, team: Team) {
    return team.team_id;
  }

  trackByDatasetId(index: number, dataset: DataSet) {
    return dataset.datasetId;
  }

  getCount(map: Map<Team, DataSet[]>) {
    return Array.from(map.values()).reduce((pre, cur) => pre.concat(cur), [])
      .length;
  }

  isMultipleTeams() {
    return this._nonExampleTeams.filter((t) => !t.isExample).length > 1;
  }

  isMultipleMaps() {
    return this._datasets.filter((d) => !d.team.isExample).length > 1;
  }

  isZeroMaps() {
    return this._datasets.filter((d) => !d.team.isExample).length == 0;
  }

  onCopy(dataset: DataSet) {
    // TODO: This needs proper state management
    this.userService.refreshUserData();
  }

  onArchive(dataset: DataSet) {
    // TODO: This needs proper state management
    const index = this._datasets.findIndex(
      (d) => d.datasetId === dataset.datasetId
    );
    this._datasets.splice(index, 1);
    this.onKeyDown('');
    this.cd.markForCheck();

    this.userService.refreshUserData();
  }

  onKeyDown(search: string) {
    this.filterMaps$.next(search);
  }

  openOnboarding() {
    this.onboarding.open(this.user);
  }
}
