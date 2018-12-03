import { isEmpty } from 'lodash';
import { Component, ChangeDetectorRef, SimpleChanges, Input } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { Team } from '../../shared/model/team.data';
import { User } from '../../shared/model/user.data';
import { Subject, Subscription } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';
import { TeamService } from '../../shared/services/team/team.service';
import { MapService } from '../../shared/services/map/map.service';
import { LoaderService } from '../../shared/services/loading/loader.service';
import { Auth } from '../../shared/services/auth/auth.service';

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    @Input("datasets") datasets: DataSet[];
    @Input("teams") teams: Team[];
    @Input("user") user: User;

    areTeamsCreated: boolean;
    areMapsCreated: boolean;
    isOnboarding: boolean;
    filterMaps$: Subject<string>
    filteredMaps: DataSet[];

    subscription: Subscription;

    constructor(private cd: ChangeDetectorRef, private router: Router, private loaderService: LoaderService,
        private teamService: TeamService, private mapService: MapService, private auth: Auth) {
        this.filterMaps$ = new Subject<string>();
    }

    private _teams: Team[];
    private _datasets: DataSet[]

    ngOnChanges(changes: SimpleChanges): void {
        console.log("ngONChanges", changes)
        if (changes.datasets && changes.datasets.currentValue) {
            this._datasets = changes.datasets.currentValue;
        }

        if (changes.teams && changes.teams.currentValue) {
            this._teams = changes.teams.currentValue
        }

        this.isOnboarding = isEmpty(this._teams) || (this._teams.length === 1 && (this._teams[0] && this._teams[0].isTemporary));
        this.cd.markForCheck();
    }

    ngOnInit() {
        console.log("ngOnInit", this.isOnboarding)
        if (this.isOnboarding) {
            this.getExampleMap()
                .then((dataset: DataSet) => {
                    this.router.navigateByUrl(`/map/${dataset.datasetId}/${dataset.initiative.getSlug()}`);
                });
        }

        this.filteredMaps = [].concat(this.datasets);
        this.subscription = this.filterMaps$.asObservable().debounceTime(250).subscribe((search) => {
            this.filteredMaps = (search === '')
                ? [].concat(this.datasets)
                : this.datasets.filter(
                    d => d.initiative.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
                        ||
                        d.team.name.toLowerCase().indexOf(search.toLowerCase()) >= 0


                );
            this.cd.markForCheck();
        })
    }

    ngOnDestroy(): void {
        if (this.subscription) this.subscription.unsubscribe();
    }


    isMultipleTeams() {
        return this._teams.length > 1;
    }

    isMultipleMaps() {
        return this._datasets.length > 1;
    }

    getExampleMap(): Promise<DataSet> {
        return this.teamService.createTemporary(this.user)
            .then(team => {
                return this.mapService.createTemplate("Example map", team.team_id)
            })
    }

    // redirectIfOnboarding() {
    //     this.areTeamsCreated = !isEmpty(this._teams) && this._teams.every(t => !t.isTemporary);
    //     console.log("teams", this._teams)
    //     this.isOnboarding = isEmpty(this._teams) || (this._teams.length === 1 && (this._teams[0] && this._teams[0].isTemporary))
    //     console.log("isOnboarding", isEmpty(this._teams), this._teams.length === 1, this._teams[0] && this._teams[0].isTemporary, this.isOnboarding)

    //     if (!this.isOnboarding) {
    //         console.log("dont redirect")
    //         return
    //     }
    //     console.log("redirect")


    //     this.loaderService.show()
    //     this.teamService.createTemporary(this.user)
    //         .then((team: Team) => {
    //             return this.auth.getUser().toPromise();
    //         })
    //         .then(user => {
    //             return this.mapService.createTemplate("Example map", user.teams[0])
    //         })
    //         // .then((dataset: DataSet) => { this.auth.getUser(); return dataset })
    //         .then((dataset: DataSet) => {
    //             this.router.navigateByUrl(`/map/${dataset.datasetId}/${dataset.initiative.getSlug()}`)
    //         })
    // }

    onKeyDown(search: string) {
        this.filterMaps$.next(search);
    }

}