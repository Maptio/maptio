import { BuildingComponent } from "./building/building.component";
import { DataService } from "./../../shared/services/data.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs/Rx";
import { Initiative } from "./../../shared/model/initiative.data";
import { DataSet } from "./../../shared/model/dataset.data";
import { Team } from "./../../shared/model/team.data";
import { EmitterService } from "./../../shared/services/emitter.service";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { ViewChild } from "@angular/core";
import {
    Component, OnInit, OnDestroy,
    trigger,
    state,
    style,
    transition,
    animate,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "../../shared/model/user.data";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { intersectionBy } from "lodash";

@Component({
    selector: "workspace",
    templateUrl: "workspace.component.html",
    styleUrls: ["./workspace.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class WorkspaceComponent implements OnInit, OnDestroy {

    @ViewChild("building")
    buildingComponent: BuildingComponent

    public isBuildingPanelCollapsed: boolean = true;
    public isDetailsPanelCollapsed: boolean = true;
    // public isSettingsPanelCollapsed: boolean = true;
    public datasetId: string;
    private routeSubscription: Subscription;
    private userSubscription: Subscription;

    public dataset: DataSet;
    public members: Array<User>;
    public team: Team;
    public teams: Team[];
    public tags: Tag[];
    public user: User;

    public openedNode: Initiative;
    public openedNodeParent: Initiative;
    public openedNodeTeamId: string;

    public mapped: Initiative;
    teamName: string;
    teamId: string;
    selectableTags: Array<Tag>;
    public isNoInitiatives:Boolean=true;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;

    ngOnDestroy(): void {
        // EmitterService.get("currentDataset").emit(undefined);
        EmitterService.get("currentTeam").emit(undefined)
        // EmitterService.get("currentMembers").emit(undefined);
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }

    constructor(private route: ActivatedRoute, private datasetFactory: DatasetFactory,
        private dataService: DataService, private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.routeSubscription = this.route.data
            .subscribe((data: { data: { dataset: DataSet, team: Team, members: User[], user: User } }) => {
                this.dataset = data.data.dataset;
                console.log(this.dataset)
                this.isNoInitiatives = !(this.dataset.initiative.children && this.dataset.initiative.children.length >0 )
         
                this.tags = data.data.dataset.tags;
                this.team = data.data.team;
                this.members = data.data.members;
                this.user = data.data.user;
                this.datasetId = this.dataset.datasetId;
                this.teamName = this.team.name;
                this.teamId = this.team.team_id;
                EmitterService.get("currentTeam").emit(this.team);
                this.buildingComponent.loadData(this.dataset.datasetId, "", this.team);
            });
    }


    saveDetailChanges() {
        this.buildingComponent.saveChanges();
    }

    applySettings(data: { initiative: Initiative, tags: Tag[] }) {
        data.initiative.traverse((node: Initiative) => {
            node.tags = intersectionBy(data.tags, node.tags, (t: Tag) => t.shortid);
        })
        this.saveChanges(data.initiative, data.tags);
        this.cd.markForCheck();
    }

    saveChanges(initiative: Initiative, tags?: Array<Tag>) {
        EmitterService.get("isSavingInitiativeData").emit(true);
        this.isNoInitiatives = !(initiative.children && initiative.children.length >0 )
                
        this.dataset.initiative = initiative;
        if (tags) {
            this.dataset.tags = tags;
            this.tags = tags
        }
        this.datasetFactory.upsert(this.dataset, this.datasetId)
            .then((hasSaved: boolean) => {
                this.dataService.set({ initiative: initiative, datasetId: this.datasetId, teamName: this.teamName, teamId: this.teamId, team: this.team, tags: this.dataset.tags, members: this.members });
                return hasSaved;
            }, (reason) => { /*console.log(reason)*/ })
            .then(() => {
                EmitterService.get("isSavingInitiativeData").emit(false);
            });

    }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }

    toggleDetailsPanel() {
        this.isDetailsPanelCollapsed = !this.isDetailsPanelCollapsed;
    }

    openDetails(node: Initiative, willCloseBuildingPanel: boolean = false) {
        this.openedNode = node;
        this.isBuildingPanelCollapsed = willCloseBuildingPanel;
        this.isDetailsPanelCollapsed = false;
    }

    addInitiative(node: Initiative) {
        this.buildingComponent.addNodeTo(node);
    }

    removeInitiative(node: Initiative) {
        this.buildingComponent.removeNode(node);
    }

    moveInitiative({ node, from, to }: { node: Initiative, from: Initiative, to: Initiative }) {
        this.buildingComponent.moveNode(node, from, to);
    }

    closeEditingPanel() {
        this.isDetailsPanelCollapsed = true;
        this.isBuildingPanelCollapsed = true;
    }

}