import { Angulartics2Mixpanel } from "angulartics2";
import { LoaderService } from "./../../shared/services/loading/loader.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Rx";
import { OnInit } from "@angular/core";
import { Component, trigger, state, style, animate, transition, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
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
import { compact, sortBy } from "lodash";
import { SafeUrl, DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: "header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.css"],
    animations: [
        trigger("fadeInOut", [
            state("in", style({
                opacity: 1, visibility: "visible", display: "inline"
            })),
            state("out", style({ opacity: 0.5, visibility: "hidden", display: "none" })),
            transition("in <=> out", [
                animate("1s ease-out")
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent implements OnInit {
    public user: User;

    public datasets$: Promise<Array<any>>;
    private teams$: Promise<Array<Team>>;
    public team: Team;
    public members: Array<User>;
    public selectedDataset: DataSet;
    public areMapsAvailable: Promise<boolean>
    public isCreateMode: boolean = false;
    private selectedTeamId: string;

    private loginForm: FormGroup;
    private createMapForm: FormGroup;

    public emitterSubscription: Subscription;
    public userSubscription: Subscription;

    isPictureLoadedMap: Map<string, boolean> = new Map<string, boolean>();
    isFadeInMap: Map<string, string> = new Map<string, string>();
    isFadeOutMap: Map<string, string> = new Map<string, string>();
    isMembersToggled: boolean;

    private _placeHolderSafe: SafeUrl;
    private _imgSafe: SafeUrl;

    constructor(public auth: Auth, private userService: UserService, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory,
        public errorService: ErrorService, private router: Router, private loader: LoaderService, private sanitizer: DomSanitizer,
        private analytics: Angulartics2Mixpanel, private cd: ChangeDetectorRef) {
        this.emitterSubscription = EmitterService.get("currentDataset")
            .subscribe((value: DataSet) => {
                this.selectedDataset = value;
                this.cd.markForCheck();
            });

        EmitterService.get("currentTeam").subscribe((value: Team) => {
            this.team = value;
            this.cd.markForCheck();
        });

        EmitterService.get("currentMembers").subscribe((value: Array<User>) => {
            if (!value) this.isMembersToggled = false;
            this.members = value || [];
            this.members.forEach(m => {
                this.isPictureLoadedMap.set(m.user_id, false);
                this.isFadeInMap.set(m.user_id, "in");
                this.isFadeOutMap.set(m.user_id, "out")
            })
            this._imgSafe = this.sanitizer.bypassSecurityTrustUrl("/assets/images/user.jpg");
        });

        this.loginForm = new FormGroup({
            "email": new FormControl("", [
                Validators.required
            ]),
            "password": new FormControl("", [
                Validators.required
            ])
        });

        this.createMapForm = new FormGroup({
            "mapName": new FormControl("", [Validators.required, Validators.minLength(2)]),
            "teamId": new FormControl(this.selectedTeamId, [Validators.required]),
        })
    }

    ngOnDestroy() {
        if (this.emitterSubscription) {
            this.emitterSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }


    ngOnInit() {
        this.userSubscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user;

            this.datasets$ = this.datasetFactory.get(this.user.datasets)
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
                .catch(() => { return [] })


            this.teams$ = this.teamFactory.get(this.user.teams)
                .then(teams => sortBy(teams, t => t.name), (r) => { return Promise.reject(r) })
                .catch(() => { return [] })

            this.cd.markForCheck();
        },
            (error: any) => { this.errorService.handleError(error) });
    }

    public isPictureLoaded(user_id: string) {
        this.isPictureLoadedMap.set(user_id, true);
        this.isFadeInMap.set(user_id, "out");
        this.isFadeOutMap.set(user_id, "in");
        this.cd.markForCheck();
    }

    isAnyPictureLoaded() {
        return Array.from(this.isPictureLoadedMap.values()).some(b => b);
    }

    public get image() {
        return this._imgSafe;
    }

    goTo(dataset: DataSet) {
        this.selectedDataset = dataset;
        this.team = dataset.team;
        if (dataset) this.router.navigate(["map", dataset.datasetId, dataset.initiative.getSlug(), "initiatives"]);
    }

    createDataset() {
        if (this.createMapForm.dirty && this.createMapForm.valid) {
            let mapName = this.createMapForm.controls["mapName"].value
            let teamId = this.createMapForm.controls["teamId"].value

            let newDataset = new DataSet({ initiative: new Initiative({ name: mapName, team_id: teamId }) });
            this.datasetFactory.create(newDataset).then((created: DataSet) => {
                this.user.datasets.push(created.datasetId)
                this.auth.getUser();
                this.isCreateMode = false;
                this.router.navigate(["map", created.datasetId, created.initiative.getSlug()]);
                this.selectedDataset = created;
                this.analytics.eventTrack("Create a map", { email: this.user.email, name: mapName, teamId: teamId })
            }).catch(this.errorService.handleError);
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
            // console.log("login", this.loginForm.controls)
            let message = "An email is required e.g. rick.sanchez@cartoonnetwork.com"
            this.router.navigateByUrl(`/login?login_message=${encodeURIComponent(message)}`);
        }
        if (this.loginForm.dirty && this.loginForm.controls["password"].invalid) {
            // console.log("login", this.loginForm.controls)
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
