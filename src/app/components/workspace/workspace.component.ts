// tslint:disable-next-line:quotemark
import { Subscription } from 'rxjs/Rx';
import { Initiative } from "./../../shared/model/initiative.data";
import { DataSet } from "./../../shared/model/dataset.data";
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
import * as _ from "lodash";

@Component({
    selector: "workspace",
    templateUrl: "workspace.component.html",
    styleUrls: ["./workspace.component.css"]
})


export class WorkspaceComponent implements OnInit, OnDestroy {

    @ViewChild("building")
    buildingComponent: BuildingComponent

    public isBuildingPanelCollapsed: boolean = true;
    public isDetailsPanelCollapsed: boolean = true;
    private datasetId: string;
    private emitterSubscription: Subscription;
    private routeSubscription: Subscription;
    private userSubscription: Subscription;

    public dataset$: Promise<DataSet>;
    public members: Promise<Array<User>>;
    public team: Promise<Team>;
    public teams: Promise<Team[]>;

    public openedNode: Initiative;
    public openedNodeParent: Initiative;

    constructor(private auth: Auth, private route: ActivatedRoute, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userFactory: UserFactory) {
        // this.emitterSubscription = EmitterService.get("currentInitiative").subscribe((value: Initiative) => {
        //     console.log(this.datasetId)
        //     this.datasetFactory.upsert(new DataSet({ _id: this.datasetId, initiative: value }), this.datasetId);
        // });
    }

    ngOnDestroy(): void {
        EmitterService.get("currentDataset").emit(undefined)
        // if (this.emitterSubscription) this.emitterSubscription.unsubscribe();
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }

    ngOnInit() {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.datasetId = params["mapid"];
            let initiativeSlug = params["slug"];

            this.dataset$ = this.datasetFactory.get(this.datasetId).then((d: DataSet) => {
                // console.log(d)
                EmitterService.get("currentDataset").emit(d)
                return d;
            });


            this.team = this.dataset$.then((dataset: DataSet) => {
                if (dataset.initiative.team_id)
                    return this.teamFactory.get(dataset.initiative.team_id)
            });

            this.members = this.team.then((team: Team) => {
                return Promise.all(
                    team.members.map(u =>
                        this.userFactory.get(u.user_id)
                            .then(u => u, () => { return Promise.reject("No user") }).catch(() => { return <User>undefined })
                    ))
                    .then(members => _.compact(members))
                    .then(members => _.sortBy(members, m => m.name))

            });

            this.buildingComponent.loadData(this.datasetId);

        });

        this.userSubscription = this.auth.getUser().subscribe((user: User) => {
            this.teams = Promise.all(
                user.teams.map(
                    (team_id: string) => this.teamFactory.get(team_id).then((team: Team) => { return team }, () => { return Promise.reject("No team") }).catch(() => { return undefined })
                )
            ).then((teams: Team[]) => {
                return teams.filter(t => { return t !== undefined })
            })

        })

    }

    saveDetailChanges() {
        this.buildingComponent.saveChanges();
    }

    saveChanges(initiative: Initiative) {
        // console.log("building.component.ts", this.nodes[0])
        // EmitterService.get("currentInitiative").emit(this.nodes[0]);
        // this.dataService.set({ initiative: this.nodes[0], datasetId: this.datasetId });
        // console.log("saving changes", initiative, this.datasetId);
        this.datasetFactory.upsert(new DataSet({ _id: this.datasetId, initiative: initiative }), this.datasetId).then((hasSaved: boolean) => {
            // console.log(hasSaved)
        }, (reason) => { console.log(reason) });
    }

    addTeamToInitiative(team: Team) {
        this.team = this.dataset$.then((dataset: DataSet) => {
            dataset.initiative.team_id = team.team_id;
            this.datasetFactory.upsert(dataset, dataset._id).then(() => {
                this.buildingComponent.loadData(dataset._id);
            })
            return team;
        });
        this.updateTeamMembers();

    }

    removeTeam() {
        this.dataset$.then((dataset: DataSet) => {
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
        // if (this.isBuildingPanelCollapsed) {
        //     this.isDetailsPanelCollapsed = true
        // }
    }

    toggleDetailsPanel() {
        this.isDetailsPanelCollapsed = !this.isDetailsPanelCollapsed;
    }


    openDetails(node: Initiative) {
        this.dataset$.then((dataset: DataSet) => {
            this.openedNodeParent = node.getParent(dataset.initiative);
            this.openedNode = node;
            this.isDetailsPanelCollapsed = false;
        })
    }

}