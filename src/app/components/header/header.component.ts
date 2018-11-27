import { Angulartics2Mixpanel } from "angulartics2";
import { Router } from "@angular/router";
import { Subscription, Observable, Subject } from "rxjs/Rx";
import { OnInit } from "@angular/core";
import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { User } from "../../shared/model/user.data";
import { Team } from "../../shared/model/team.data";
import { DataSet } from "../../shared/model/dataset.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { TeamFactory } from "../../shared/services/team.factory";
import { EmitterService } from "../../shared/services/emitter.service";
import { ErrorService } from "../../shared/services/error/error.service";
import { Initiative } from "../../shared/model/initiative.data";
import { UserService } from "../../shared/services/user/user.service";
import { sortBy } from "lodash";
import { SafeUrl, DomSanitizer } from "@angular/platform-browser";
import { BillingService } from "../../shared/services/billing/billing.service";
import { LoaderService } from "../../shared/services/loading/loader.service";

@Component({
    selector: "header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.css"],
    changeDetection: ChangeDetectionStrategy.Default
})

export class HeaderComponent implements OnInit {
    public user: User;

    public datasets: Array<any>;
    private teams: Array<Team>;
    public team: Team;
    // public members: Array<User>;
    public selectedDataset: DataSet;
    public areMapsAvailable: Promise<boolean>
    public isCreateMode: boolean = false;
    private selectedTeamId: string;

    public emitterSubscription: Subscription;
    public userSubscription: Subscription;

    public isSaving: Boolean = false;

    constructor(public auth: Auth, private userService: UserService, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory,
        public errorService: ErrorService, private router: Router, public loaderService: LoaderService,
        private analytics: Angulartics2Mixpanel, private cd: ChangeDetectorRef, private billingService: BillingService) {

        let [teamDefined, teamUndefined] = EmitterService.get("currentTeam").partition(team => team);

        teamDefined.flatMap((team: Team) => {
            return this.billingService.getTeamStatus(team).map((value: { created_at: Date, freeTrialLength: Number, isPaying: Boolean }) => {
                team.createdAt = value.created_at;
                team.freeTrialLength = value.freeTrialLength;
                team.isPaying = value.isPaying;
                return team;
            })
        })
            .subscribe((value: Team) => {
                this.team = value;
                this.cd.markForCheck();
            });

        teamUndefined
            .subscribe((value: Team) => {
                this.team = value;
                this.cd.markForCheck();
            });
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }


    ngOnInit() {
        this.userSubscription = EmitterService.get("headerUser").subscribe((user: User) => {
            this.user = user;

            this.datasetFactory.get(this.user.datasets, true)
                .then(datasets => {
                    return datasets.map(d => {
                        return {
                            datasetId: d.datasetId,
                            initiative: d.initiative,
                            name: d.initiative.name,
                            team_id: (d.initiative && d.initiative.team_id) ? d.initiative.team_id : undefined,
                        }
                    }
                    )
                }, (r) => { return Promise.reject(r) })
                .then(datasets => sortBy(datasets, d => d.name))
                .then(datasets => { this.datasets = datasets })
                .catch(() => { return [] })


            this.teamFactory.get(this.user.teams)
                .then(teams => sortBy(teams, t => t.name), (r) => { return Promise.reject(r) })
                .then(teams => { this.teams = teams; return teams })
                .catch(() => { return [] })

            this.cd.markForCheck();
        },
            (error: any) => { this.errorService.handleError(error) });
    }

    onNewMap(dataset: DataSet) {
        this.isCreateMode = false;
        this.selectedDataset = dataset;
        this.analytics.eventTrack("Create a map", { email: this.user.email, name: dataset.initiative.name, team: dataset.initiative.team_id })

    }

    isSignUp() {
        return this.router.url.startsWith("/login") || this.router.url.startsWith("/signup") || this.router.url.startsWith("/forgot")
    }

    toggleCreateMode() {
        this.isCreateMode = !this.isCreateMode;
    }

}
