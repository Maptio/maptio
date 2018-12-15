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
import { sortBy, isEmpty } from "lodash";
import { SafeUrl, DomSanitizer } from "@angular/platform-browser";
import { BillingService } from "../../shared/services/billing/billing.service";
import { LoaderService } from "../../shared/services/loading/loader.service";
import { InstructionsService } from "../../shared/components/instructions/instructions.service";
import { OnboardingService } from "../../shared/components/onboarding/onboarding.service";

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
    public selectedDataset: DataSet;
    public areMapsAvailable: Promise<boolean>
    public isCreateMode: boolean = false;

    public emitterSubscription: Subscription;
    public userSubscription: Subscription;

    public isSaving: Boolean = false;
    public isSandbox: boolean;

    constructor(public auth: Auth, private userService: UserService, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory,
        public errorService: ErrorService, private router: Router, public loaderService: LoaderService,
        private analytics: Angulartics2Mixpanel, private cd: ChangeDetectorRef, private billingService: BillingService,
        private instructions: InstructionsService, private onboarding: OnboardingService) {

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
                this.isSandbox = this.team.isExample;
                this.cd.markForCheck();
            });

        teamUndefined
            .subscribe((value: Team) => {
                this.team = value;
                this.isSandbox = false;
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
        this.userSubscription = EmitterService.get("headerUser")
            .mergeMap((user: User) => {
                console.log("1")
                return Observable.forkJoin(
                    isEmpty(user.datasets) ? Promise.resolve([]) : this.datasetFactory.get(user.datasets, true),
                    isEmpty(user.teams) ? Promise.resolve([]) : this.teamFactory.get(user.teams),
                    Promise.resolve(user)
                )
            })
            .map(([datasets, teams, user]: [DataSet[], Team[], User]) => {
                console.log("2")
                return [datasets.filter(d => !d.isArchived).map(d => {
                    d.team = teams.find(t => d.initiative.team_id === t.team_id);
                    return d
                }), teams, user]
            })
            .map(([datasets, teams, user]: [DataSet[], Team[], User]) => {
                console.log("3")
                return {
                    datasets: sortBy(datasets, d => d.initiative.name),
                    teams: sortBy(teams, t => t.name),
                    user: user
                }
            })
            .subscribe((data: { datasets: DataSet[], teams: Team[], user: User }) => {
                console.log("4")
                this.user = data.user;
                this.datasets = data.datasets;
                this.teams = data.teams;
                this.cd.markForCheck();
            },
                (error: any) => { console.error(error) });
    }

    onNewMap(dataset: DataSet) {
        this.isCreateMode = false;
        this.selectedDataset = dataset;
        this.analytics.eventTrack("Create a map", { email: this.user.email, name: dataset.initiative.name, team: dataset.initiative.team_id })

    }

    isSignUp() {
        return this.router.url.startsWith("/login") || this.router.url.startsWith("/signup") || this.router.url.startsWith("/forgot")
    }

    isMap() {
        return this.router.url.startsWith("/map")
    }

    isHome() {
        return this.router.url.startsWith("/home")

    }

    toggleCreateMode() {
        this.isCreateMode = !this.isCreateMode;
    }

    openInstructions() {
        this.instructions.openTutorial(this.user);
    }

    openOnboarding() {
        this.onboarding.open(this.user);
    }

}
