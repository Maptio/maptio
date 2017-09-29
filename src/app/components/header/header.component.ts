import { LoaderService } from "./../../shared/services/loading/loader.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Rx";
import { EventEmitter } from "@angular/core";
import { OnInit } from "@angular/core";
import { Component, Output } from "@angular/core";
import { User } from "../../shared/model/user.data";
import { Team } from "../../shared/model/team.data";
import { DataSet } from "../../shared/model/dataset.data";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Auth } from "../../shared/services/auth/auth.service";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { TeamFactory } from "../../shared/services/team.factory";
import { EmitterService } from "../../shared/services/emitter.service";
import { UserFactory } from "../../shared/services/user.factory";
import { ErrorService } from "../../shared/services/error/error.service";
import { Initiative } from "../../shared/model/initiative.data";
import { UserService } from "../../shared/services/user/user.service";


@Component({
    selector: "header",
    template: require("./header.component.html"),
    styleUrls: ["./header.component.css"]
})

export class HeaderComponent implements OnInit {
    public user: User;

    @Output("openHelp") openHelpEvent = new EventEmitter<void>();
    @Output("createDataset") createDatasetEvent = new EventEmitter<void>();

    public datasets$: Promise<Array<any>>;
    private teams$: Promise<Array<Team>>;
    public selectedDataset: DataSet;
    private isValid: boolean = false;
    private isSaving: Promise<boolean> = Promise.resolve(false);
    private timeToSaveInSec: Promise<number>;
    public areMapsAvailable: Promise<boolean>

    private selectedTeam: Team;

    private loginForm: FormGroup;

    public emitterSubscription: Subscription;
    public userSubscription: Subscription;

    constructor(private auth: Auth, private userService: UserService, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory,
        private userFactory: UserFactory, public errorService: ErrorService, private router: Router, private loader: LoaderService) {
        this.emitterSubscription = EmitterService.get("currentDataset").subscribe((value: DataSet) => {
            this.selectedDataset = value;
        });

        this.userSubscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user;

            this.datasets$ = Promise.all(
                // get all datasets available to this user accross all teams
                this.user.datasets.map(
                    dataset_id => this.datasetFactory.get(dataset_id).then(d => d, () => { return Promise.reject("No dataset") }).catch(() => { return <DataSet>undefined })
                )
            )
                .then(datasets => {
                    return datasets.filter(d => d).map(d => {

                        if (d)
                            return {
                                _id: d._id,
                                initiative: d.initiative,
                                name: d.initiative.name,
                                team_id: (d.initiative && d.initiative.team_id) ? d.initiative.team_id : undefined,
                            }
                    })
                })
        },
            (error: any) => { this.errorService.handleError(error) });


        this.loginForm = new FormGroup({
            "email": new FormControl("", [
                Validators.required
            ]),
            "password": new FormControl("", [
                Validators.required
            ])
        });
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
    }

    goTo(dataset: DataSet) {
        this.selectedDataset = dataset;
        if (dataset) this.router.navigate(["map", dataset._id, dataset.initiative.getSlug(), "initiatives"]);
    }

    createTeam(teamName: string) {
        this.teamFactory.create(new Team({ name: teamName, members: [this.user] })).then((team: Team) => {
            this.user.teams.push(team.team_id);
            this.userFactory.upsert(this.user).then((result: boolean) => {
                this.router.navigate(["/team", team.team_id, team.getSlug()]);
            })

        })

    }


    createDataset(datasetName: string) {
        let newDataset = new DataSet({ initiative: new Initiative({ name: datasetName }) });
        this.datasetFactory.create(newDataset).then((created: DataSet) => {
            this.datasetFactory.add(created, this.user).then((result: boolean) => {
                this.router.navigate(["map", created._id]);
                this.selectedDataset = created;
            }).catch(this.errorService.handleError);
        }).catch(this.errorService.handleError);
        this.ngOnInit();
    }

    // TODO: create validation service
    validate(name: string) {
        this.isValid = name !== "" && name !== undefined;
    }

    logout() {
        this.auth.logout();
    }

    login() {

        if (this.loginForm.dirty && this.loginForm.valid) {
            localStorage.clear();
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
        }
    }

}
