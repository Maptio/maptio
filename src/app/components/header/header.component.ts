import { TeamFactory } from './../../shared/services/team.factory';
import { Router } from "@angular/router";
import { EmitterService } from "./../../shared/services/emitter.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { EventEmitter } from "@angular/core";
import { Component, OnInit, Input, Output } from "@angular/core";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { DataSet } from "./../../shared/model/dataset.data";
import { User } from "./../../shared/model/user.data";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Team } from "../../shared/model/team.data";

@Component({
    selector: "header",
    template: require("./header.component.html"),
    styles: [require("./header.component.css").toString()]
})

export class HeaderComponent implements OnInit {
    @Input("user") user: User;

    @Output("openHelp") openHelpEvent = new EventEmitter<void>();
    @Output("createDataset") createDatasetEvent = new EventEmitter<void>();

    private datasets$: Promise<Array<DataSet>>;
    private teams$: Promise<Array<Team>>;
    private selectedDatasetName: string;
    private isValid: boolean = false;
    private newDatasetName: string;
    private isSaving: Promise<boolean> = Promise.resolve(false);
    private timeToSaveInSec: Promise<number>;

    private selectedTeam: Team;

    // HACK : for demonstration purposes
    private VESTD = new DataSet({ _id: "58c9d273734d1d2ca8564da2", name: "Vestd" })

    constructor(private auth: Auth, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private errorService: ErrorService, private router: Router) {
        EmitterService.get("currentDataset").subscribe((value: any) => {
            this.isSaving = Promise.resolve<boolean>(true);
        });
        EmitterService.get("datasetName").subscribe((value: string) => {
            this.selectedDatasetName = value;
        });
        EmitterService.get("timeToSaveInSec").subscribe((value: number) => {
            this.timeToSaveInSec = Promise.resolve(value);
        });
    }

    ngOnInit() {
        this.auth.getUser().subscribe(
            (user: User) => {

                this.user = user;

                this.teams$ = Promise.all(
                    this.user.teams.map(
                        team_id => this.teamFactory.get(team_id).then((resolved: Team) => { return resolved })
                    )
                )
                    .then(teams => { return teams });

                this.teams$.then((teams: Team[]) => {
                    this.selectedTeam = this.selectedTeam || teams[0];
                })
            },
            (error: any) => { this.errorService.handleError(error) });
    }

    chooseTeam(team: Team) {
        this.selectedTeam = team;
        this.datasets$ = Promise.all(
            this.user.datasets.map(
                dataset_id => this.datasetFactory.get(dataset_id).then((resolved: DataSet) => { return resolved })
            )
        )
        // only shows the datasets accessible by the selected team
            .then(datasets => { return datasets.filter(d => d.team_id === this.selectedTeam.team_id) });
    }

    openHelp() {
        this.openHelpEvent.emit();
    }

    openDataset(dataset: DataSet) {
        this.selectedDatasetName = dataset.name;
        this.router.navigate(["workspace", dataset._id]);
    }

    createDataset() {
        let newDataset = new DataSet({ name: this.newDatasetName, createdOn: new Date() });
        this.datasetFactory.create(newDataset).then((created: DataSet) => {
            this.datasetFactory.add(created, this.user).then((result: boolean) => {
                this.openDataset(created);
            }).catch(this.errorService.handleError);
        }).catch(this.errorService.handleError);
        this.ngOnInit();
    }

    // TODO: create validation service
    validate(name: string) {
        this.newDatasetName = name.trim();
        this.isValid = this.newDatasetName !== "" && this.newDatasetName !== undefined;
    }

}