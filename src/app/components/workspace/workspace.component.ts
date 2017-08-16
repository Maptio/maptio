import { Initiative } from './../../shared/model/initiative.data';
import { DataSet } from './../../shared/model/dataset.data';
import { Team } from "./../../shared/model/team.data";
import { UserFactory } from "./../../shared/services/user.factory";
import { TeamFactory } from "./../../shared/services/team.factory";
import { EmitterService } from "./../../shared/services/emitter.service";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { ViewChild } from "@angular/core";
import { BuildingComponent } from "./../building/building.component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";

@Component({
    selector: "workspace",
    template: require("./workspace.component.html"),
    styleUrls: ["./workspace.component.css"]
})


export class WorkspaceComponent implements OnInit, OnDestroy {

    @ViewChild("building")
    buildingComponent: BuildingComponent

    public isBuildingPanelCollapsed: boolean = true;
    private datasetId: string;
    private subscription: any;

    public dataset: Promise<DataSet>;
    public members: Promise<Array<User>>;
    public team: Promise<Team>;
    public teams: Promise<Team[]>;

    constructor(private auth: Auth, private route: ActivatedRoute, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userFactory: UserFactory) {
        this.subscription = EmitterService.get("currentInitiative").subscribe((value: Initiative) => {
            this.datasetFactory.upsert(new DataSet({ _id: this.datasetId, initiative: value }), this.datasetId);
        });
    }

    ngOnDestroy(): void {
        EmitterService.get("currentDataset").emit(undefined)
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            this.datasetId = params["workspaceid"];
            let initiativeSlug = params["slug"];
            this.buildingComponent.loadData(this.datasetId, initiativeSlug);

            this.dataset = this.datasetFactory.get(this.datasetId).then((d: DataSet) => {
                EmitterService.get("currentDataset").emit(d)
                return d;
            });

            this.team = this.dataset.then((dataset: DataSet) => {
                if (dataset.initiative.team_id)
                    return this.teamFactory.get(dataset.initiative.team_id)
            });

            this.team.then((team: Team) => {
                this.members = Promise.all(team.members.map(u => this.userFactory.get(u.user_id)))
            })
        });

        this.auth.getUser().subscribe((user: User) => {
            this.teams = Promise.all(
                user.teams.map(
                    (team_id: string) => this.teamFactory.get(team_id).then((team: Team) => { return team })
                )
            )
                .then(teams => { return teams });
        })

    }

    addTeamToInitiative(team: Team) {
        this.team = this.dataset.then((dataset: DataSet) => {
            dataset.initiative.team_id = team.team_id;
            this.datasetFactory.upsert(dataset, dataset._id).then(() => {
                this.buildingComponent.loadData(dataset._id);
            })
            return team;
        });
        this.updateTeamMembers();

    }

    removeTeam() {
        this.dataset.then((dataset: DataSet) => {
            dataset.initiative.team_id = undefined;
            this.datasetFactory.upsert(dataset, dataset._id).then(() => {
                this.buildingComponent.loadData(dataset._id);
            });
        });
        this.team = Promise.resolve(null)
        this.updateTeamMembers();
    }

    updateTeamMembers() {
        this.members = this.team
            .then((team: Team) => {
                if (team)
                    return team.members;
            });
    }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }

}