import { isEmpty } from 'lodash';
import { Component, ChangeDetectorRef, SimpleChanges, Input } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { Team } from '../../shared/model/team.data';
import { User } from '../../shared/model/user.data';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
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
    mapsCount:number;
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
            this.mapsCount = this._datasets.length;
            this.filterMaps$.next('');
            this.cd.markForCheck();
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

        this.filteredMaps = [].concat(this._datasets);
        this.subscription = this.filterMaps$.asObservable().debounceTime(250).subscribe((search) => {
            this.filteredMaps = (search === '')
                ? [].concat(this._datasets)
                : this._datasets.filter(
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

    onCopy(dataset:DataSet){
        console.log("onCopy", dataset)
        this.auth.getUser().toPromise().then(()=> { console.log("here") ; this.cd.markForCheck()} );
    }

    getExampleMap(): Promise<DataSet> {
        // temporary team is already created
        if (this._teams.length === 1) {
            if (this._datasets.length === 0) {
                // there is no dataset, create a new one
                return this.mapService.createTemplate("Example map", this._teams[0].team_id)
            } else {
                return this.mapService.get(this._datasets[0].datasetId)
            }
        }
        // no team createt yet, so create a temp one and add a dataset to it
        else {
            return this.teamService.createTemporary(this.user)
                .then(team => {
                    return this.mapService.createTemplate("Example map", team.team_id)
                })
        }
    }

    onKeyDown(search: string) {
        this.filterMaps$.next(search);
    }

}