import { Auth } from "../../../../core/authentication/auth.service";
import { Component, ChangeDetectorRef } from "@angular/core";
import { Subscription, Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { sortBy, isEmpty } from "lodash-es";
import { LoaderService } from "../../../../shared/services/loading/loader.service";
import { EmitterService } from "../../../../shared/services/emitter.service";
import { InstructionsService } from "../../../../shared/components/instructions/instructions.service";
import { environment } from "../../../../config/environment";

@Component({
    selector: "home",
    templateUrl: "./home.page.html",
    styleUrls: ["./home.page.css"]
})
export class HomeComponent {
    private routeSubscription: Subscription;
    public datasets: DataSet[];
    public teams: Team[];
    public user: User;
    public isLoading: Boolean;
    public isOnboarding: boolean;
    SCREENSHOT_URL = environment.SCREENSHOT_URL;
    SCREENSHOT_URL_FALLBACK = environment.SCREENSHOT_URL_FALLBACK;

    constructor(public auth: Auth, private route: ActivatedRoute, private cd: ChangeDetectorRef,
        public datasetFactory: DatasetFactory, public teamFactory: TeamFactory, public loaderService: LoaderService,
        private instructions:InstructionsService) { }

    ngOnInit(): void {
        if (!this.auth.allAuthenticated()) return;
        this.loaderService.show();
        this.isLoading = true;
        this.isOnboarding = true;
        this.cd.markForCheck();
        this.routeSubscription = this.auth.getUser()
            .mergeMap((user: User) => {
                return Observable.forkJoin(
                    isEmpty(user.datasets) ? Promise.resolve([]) : this.datasetFactory.get(user.datasets, false),
                    isEmpty(user.teams) ? Promise.resolve([]) : this.teamFactory.get(user.teams),
                    Promise.resolve(user)
                )
            })
            .map(([datasets, teams, user]: [DataSet[], Team[], User]) => {
                return [
                    datasets.filter(d => !d.isArchived).map(d => {
                        let i = 0
                        d.initiative.traverse((n) => { i++ })
                        d.depth = i;
                        return d;
                    }),
                    teams,
                    user
                ]
            })
            .map(([datasets, teams, user]: [DataSet[], Team[], User]) => {
                return [datasets.map(d => {
                    d.team = teams.find(t => d.initiative.team_id === t.team_id);
                    return d
                }), teams, user]
            })
            .map(([datasets, teams, user]: [DataSet[], Team[], User]) => {
                return { datasets: sortBy(datasets, d => d.initiative.name), teams: teams, user: user }
            })
            .subscribe((data: { datasets: DataSet[], teams: Team[], user: User }) => {
                this.teams = data.teams;
                this.datasets = data.datasets
                this.user = data.user;
                this.isLoading = false;
                if (isEmpty(this.teams)) {
                    this.instructions.openWelcome(this.user);
                }
                EmitterService.get("currentTeam").emit(this.teams[0])
                this.isOnboarding = isEmpty(this.user.teams);
                this.cd.markForCheck();
                this.loaderService.hide();
            });

    }

    ngOnDestroy(): void {
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
    }
}