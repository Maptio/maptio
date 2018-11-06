import { isEmpty } from 'lodash';
import { Component, ChangeDetectorRef, SimpleChanges, Input } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { Team } from '../../shared/model/team.data';
import { User } from '../../shared/model/user.data';
import { Subject, Subscription } from '../../../../node_modules/rxjs';

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    @Input("datasets") datasets: DataSet[];
    @Input("teams") teams: Team[];
    @Input("user") user: User;

    isZeroTeam: Boolean = true;
    isZeroMaps: Boolean = true;
    isZeroInitiative: Boolean = true;
    filterMaps$: Subject<string>
    filteredMaps: DataSet[];

    subscription:Subscription;

    constructor(private cd: ChangeDetectorRef) {
        this.filterMaps$ = new Subject<string>();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.datasets && changes.datasets.currentValue) {
            this.datasets = changes.datasets.currentValue;
            this.isZeroMaps = isEmpty(this.datasets);
            if (!this.isZeroMaps) {
                this.isZeroInitiative = !this.datasets[0].initiative.children || this.datasets[0].initiative.children.length === 0;
            }
        }

        if (changes.teams && changes.teams.currentValue) {
            this.isZeroTeam = isEmpty(changes.teams.currentValue)
        }
        this.cd.markForCheck();
    }

    ngOnInit(){
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
        if(this.subscription) this.subscription.unsubscribe();
    }

    isOnboarding() {
        return this.isZeroTeam || this.isZeroMaps || this.isZeroInitiative;
    }

    onKeyDown(search: string) {
        this.filterMaps$.next(search);
    }

}