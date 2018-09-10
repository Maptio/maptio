import { Angulartics2Mixpanel } from "angulartics2";
import { LoaderService } from "./../../shared/services/loading/loader.service";
import { Router } from "@angular/router";
import { Subscription, Observable, Subject } from "rxjs/Rx";
import { OnInit } from "@angular/core";
import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { User } from "../../shared/model/user.data";
import { Team } from "../../shared/model/team.data";
import { DataSet } from "../../shared/model/dataset.data";
import { FormGroup, FormControl, Validators } from "@angular/forms";
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

    private loginForm: FormGroup;
    private createMapForm: FormGroup;

    public emitterSubscription: Subscription;
    public userSubscription: Subscription;

    public isSaving: Boolean = false;

    constructor(public auth: Auth, private userService: UserService, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory,
        public errorService: ErrorService, private router: Router, private loader: LoaderService,
        private analytics: Angulartics2Mixpanel, private cd: ChangeDetectorRef, private billingService: BillingService) {


        EmitterService.get("isSavingInitiativeData").skip(1).subscribe((isSaving: Boolean) => {
            this.isSaving = isSaving
            this.cd.markForCheck();
        })

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

        this.loginForm = new FormGroup({
            "email": new FormControl("", [
                Validators.required
            ]),
            "password": new FormControl("", [
                Validators.required
            ])
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
            console.log("header", user)
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
                .then((teams) => {
                    this.createMapForm = new FormGroup({
                        "mapName": new FormControl(teams.length > 1 ? "" : teams[0].name, [Validators.required, Validators.minLength(2)]),
                        "teamId": new FormControl(teams.length > 1 ? null : teams[0].team_id, [Validators.required]),
                    })
                })
                .catch(() => { return [] })



            this.cd.markForCheck();
        },
            (error: any) => { this.errorService.handleError(error) });
    }

    createDataset() {
        console.log(this.createMapForm)
        if (this.createMapForm.valid) {
            let mapName = this.createMapForm.controls["mapName"].value
            let teamId = this.createMapForm.controls["teamId"].value

            let newDataset = new DataSet({ initiative: new Initiative({ name: mapName, team_id: teamId }) });
            this.datasetFactory.create(newDataset)
                .then((created: DataSet) => {
                    this.user.datasets.push(created.datasetId)
                    this.auth.getUser();
                    this.isCreateMode = false;
                    this.selectedDataset = created;
                    this.analytics.eventTrack("Create a map", { email: this.user.email, name: mapName, teamId: teamId })
                    this.createMapForm.reset();
                    this.cd.markForCheck();
                    return created
                })
                .then(created => {
                    this.router.navigate(["map", created.datasetId, created.initiative.getSlug()]);
                })
                .catch(this.errorService.handleError);
            this.ngOnInit();
        }
    }

    createTeam() {
        this.isCreateMode = false;
        this.router.navigate(["/teams"]);
    }

    logout() {
        this.auth.logout();
    }

    login() {

        if (this.loginForm.dirty && this.loginForm.controls["email"].invalid) {
            let message = "An email is required e.g. rick.sanchez@cartoonnetwork.com"
            this.router.navigateByUrl(`/login?login_message=${encodeURIComponent(message)}`);
        }
        if (this.loginForm.dirty && this.loginForm.controls["password"].invalid) {
            let message = "Password required"
            this.router.navigateByUrl(`/login?login_message=${encodeURIComponent(message)}`);
        }

        if (this.loginForm.dirty && this.loginForm.valid) {
            this.auth.clear();
            this.loader.show();
            let email = this.loginForm.controls["email"].value
            let password = this.loginForm.controls["password"].value

            this.userService.isUserExist(email)
                .then((isUserExist: boolean) => {
                    if (isUserExist) {
                        this.auth.login(email, password);
                        EmitterService.get("loginErrorMessage").subscribe((loginErrorMessage: string) => {
                            loginErrorMessage =
                                (loginErrorMessage === "Wrong email or password.") ? "Wrong password" : loginErrorMessage;
                            this.router.navigateByUrl(`/login?login_message=${encodeURIComponent(loginErrorMessage)}`);
                        })
                    }
                    else {
                        let message = "We don't know that email."
                        this.router.navigateByUrl(`/login?login_message=${encodeURIComponent(message)}`);
                    }
                    this.loader.show();
                })
                .then(() => {
                    this.cd.markForCheck();
                })
        }
    }

    toggleCreateMode() {
        this.isCreateMode = !this.isCreateMode;
    }

}
