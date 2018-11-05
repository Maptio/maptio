import { BuildingComponent } from "./building/building.component";
import { DataService, CounterService } from "./../../shared/services/data.service";
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
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "../../shared/model/user.data";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { intersectionBy } from "lodash";
import { UIService } from "../../shared/services/ui/ui.service";
import { Intercom } from "ng-intercom";

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
    public isBuildingVisible:boolean;
    public isEmptyMap: Boolean;
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
    public canvasYMargin: number;
    public canvasHeight: number

    public openedNode: Initiative;
    public openedNodeParent: Initiative;
    public openedNodeTeamId: string;

    public mapped: Initiative;
    teamName: string;
    teamId: string;
    selectableTags: Array<Tag>;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;

    ngOnDestroy(): void {
        EmitterService.get("currentTeam").emit(undefined)
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }

    constructor(private route: ActivatedRoute, private datasetFactory: DatasetFactory,
        private dataService: DataService, private cd: ChangeDetectorRef, private uiService: UIService, private intercom: Intercom) {
        this.canvasYMargin = uiService.getCanvasYMargin();
        this.canvasHeight = uiService.getCanvasHeight();
    }

    ngOnInit() {
        this.routeSubscription = this.route.data
            .do((data)=>{
                let newDatasetId = data.data.dataset.datasetId;
                if(newDatasetId !== this.datasetId){
                    this.closeEditingPanel();
                    this.cd.markForCheck()
                } 
            })
            .subscribe((data: { data: { dataset: DataSet, team: Team, members: User[], user: User } }) => {
                this.dataset = data.data.dataset;
                this.tags = data.data.dataset.tags;
                this.team = data.data.team;
                this.members = data.data.members;
                this.user = data.data.user;
                this.datasetId = this.dataset.datasetId;
                this.teamName = this.team.name;
                this.teamId = this.team.team_id;
                EmitterService.get("currentTeam").emit(this.team);
                this.buildingComponent.loadData(this.dataset, this.team, this.members);
                this.isEmptyMap = !this.dataset.initiative.children || this.dataset.initiative.children.length === 0;
                this.cd.markForCheck();
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
        this.isEmptyMap = !initiative.children || initiative.children.length === 0;
        this.cd.markForCheck();
        EmitterService.get("isSavingInitiativeData").emit(true);

        this.dataset.initiative = initiative;
        if (tags) {
            this.dataset.tags = tags;
            this.tags = tags
        }

        let depth = 0
        initiative.traverse((n) => { depth++ });

        this.datasetFactory.upsert(this.dataset, this.datasetId)
            .then((hasSaved: boolean) => {
                this.dataService.set({ initiative: initiative, dataset: this.dataset, team: this.team,  members: this.members });
                return hasSaved;
            }, (reason) => { console.error(reason) })
            .then(() => {

                let depth = 0
                initiative.traverse((n) => { depth++ });
                this.intercom.trackEvent("Editing map", { team: this.team.name, teamId: this.team.team_id, datasetId: this.datasetId, mapName: initiative.name, circles: depth });
                return;
            })
            .then(() => {
                EmitterService.get("isSavingInitiativeData").emit(false);

                // this.counterService.set({ datasetId: this.datasetId, time: moment() })
            });
    }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }

    toggleDetailsPanel() {
        this.isDetailsPanelCollapsed = !this.isDetailsPanelCollapsed;
    }

    isOnePanelOpened() {
        return this.isBuildingPanelCollapsed !== this.isDetailsPanelCollapsed;
    }

    isTwoPanelsOpened() {
        return !this.isDetailsPanelCollapsed && !this.isBuildingPanelCollapsed;
    }

    openDetails(node: Initiative, willCloseBuildingPanel: boolean = false) {
        this.openedNode = node;
        this.isBuildingPanelCollapsed = willCloseBuildingPanel;
        this.isDetailsPanelCollapsed = false;
    }

    addInitiative(data : {node: Initiative, subNode:Initiative}) {
        this.buildingComponent.addNodeTo(data.node, data.subNode);
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

    toggleEditingPanelsVisibility(isVisible:boolean){
        this.isBuildingVisible = isVisible;
        this.cd.markForCheck();
    }



}