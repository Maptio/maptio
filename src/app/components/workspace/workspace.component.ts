import { Team } from "./../../shared/model/team.data";
import { UserFactory } from "./../../shared/services/user.factory";
import { TeamFactory } from "./../../shared/services/team.factory";
import { EmitterService } from "./../../shared/services/emitter.service";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { ViewChild } from "@angular/core";
import { BuildingComponent } from "./../building/building.component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { DataSet } from "../../shared/model/dataset.data";
import { User } from "../../shared/model/user.data";

@Component({
    selector: "workspace",
    template: require("./workspace.component.html"),
    styles: [require("./workspace.component.css").toString()]
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

    constructor(private route: ActivatedRoute, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userFactory: UserFactory) {
        this.subscription = EmitterService.get("currentDataset").subscribe((value: any) => {
            this.datasetFactory.upsert(value, this.datasetId);
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            this.datasetId = params["workspaceid"];
            let initiativeSlug = params["slug"];
            this.buildingComponent.loadData(this.datasetId, initiativeSlug);

            this.dataset = this.datasetFactory.get(this.datasetId);

            this.team = this.dataset.then((dataset: DataSet) => {
                return this.teamFactory.get(dataset.team_id)
            })

            this.members = this.team
                .then((t: Team) => {
                    return t.members;
                });
        });
    }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }

}