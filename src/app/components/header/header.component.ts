import { UserFactory } from "./../../shared/services/user.factory";
import { Initiative } from "./../../shared/model/initiative.data";
import { TeamFactory } from "./../../shared/services/team.factory";
import { Router } from "@angular/router";
import { EmitterService } from "./../../shared/services/emitter.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { EventEmitter } from "@angular/core";
import { Component, OnInit, Output } from "@angular/core";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { DataSet } from "./../../shared/model/dataset.data";
import { User } from "./../../shared/model/user.data";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Team } from "../../shared/model/team.data";

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

    // private VESTD_ID: string = "58c9d273734d1d2ca8564da2";

    constructor(private auth: Auth, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userFactory: UserFactory, private errorService: ErrorService, private router: Router) {
        EmitterService.get("currentDataset").subscribe((value: DataSet) => {
            this.selectedDataset = value;
        },
        (error: any) => { this.errorService.handleError(error) });
    }

    ngOnInit() {
        this.auth.getUser().subscribe(
            (user: User) => {

                this.user = user;
                if (!user) {
                    return
                }

                let getDataSets = Promise.all(
                    // get all datasets available to this user accross all teams
                    this.user.datasets.map(
                        dataset_id => this.datasetFactory.get(dataset_id).then((resolved: DataSet) => { return resolved })
                    )
                )
                    .then(datasets => datasets);

                this.teams$ = Promise.all(
                    this.user.teams.map(
                        team_id => this.teamFactory.get(team_id).then((team: Team) => { return team })
                    )
                )
                    .then(teams => { return teams });

                this.datasets$ = Promise.all([getDataSets, this.teams$])
                    .then((value) => {
                        let datasets = value[0];
                        let teams = value[1];

                        return datasets.map(d => {
                            return {
                                _id: d._id,
                                initiative: d.initiative,
                                name: d.initiative.name,
                                team_id: d.initiative.team_id,
                                team: teams.filter(t => t.team_id === d.initiative.team_id)[0]
                            }
                        })
                    });

                this.teams$.then((teams: Team[]) => {
                    this.selectedTeam = this.selectedTeam || teams[0];
                })
            },
            (error: any) => { this.errorService.handleError(error) });
        this.selectedDataset = undefined;
    }

    goTo(dataset: DataSet) {
        this.selectedDataset = dataset;
        this.router.navigate(["map", dataset._id, "initiatives"]);
    }

    createTeam(teamName: string) {
        this.teamFactory.create(new Team({ name: teamName, members: [this.user] })).then((team: Team) => {
            this.user.teams.push(team.team_id);
            this.userFactory.upsert(this.user).then((result: boolean) => {
                this.router.navigate(["account/team", team.team_id]);
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
        // this.newDatasetName = name.trim();
        this.isValid = name !== "" && name !== undefined;
    }

    logout() {
        this.auth.logout();
    }

}