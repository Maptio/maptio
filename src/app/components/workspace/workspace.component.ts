import { DataService } from "./../../shared/services/data.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs/Rx";
import { Initiative } from "./../../shared/model/initiative.data";
import { DataSet } from "./../../shared/model/dataset.data";
import { Team } from "./../../shared/model/team.data";
import { EmitterService } from "./../../shared/services/emitter.service";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { ViewChild } from "@angular/core";
import { BuildingComponent } from "./../building/building.component";
import {
    Component, OnInit, OnDestroy,
    trigger,
    state,
    style,
    transition,
    animate,
    ChangeDetectorRef
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "../../shared/model/user.data";
import { SafeUrl, DomSanitizer } from "@angular/platform-browser";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
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
    // public isSettingsPanelCollapsed: boolean = true;
    public datasetId: string;
    private routeSubscription: Subscription;
    private userSubscription: Subscription;

    public dataset: DataSet;
    public members: Array<User>;
    public team: Team;
    public teams: Team[];
    public tags: Tag[];

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
        EmitterService.get("currentDataset").emit(undefined);
        EmitterService.get("currentTeam").emit(undefined)
        EmitterService.get("currentMembers").emit(undefined);
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }

    constructor(private route: ActivatedRoute, private datasetFactory: DatasetFactory,
        private dataService: DataService, private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.routeSubscription = this.route.data
            .subscribe((data: { data: { dataset: DataSet, team: Team, members: User[] } }) => {
                this.dataset = data.data.dataset;
                this.tags = data.data.dataset.tags;
                this.team = data.data.team;
                this.members = data.data.members;
                this.datasetId = this.dataset.datasetId;
                this.teamName = this.team.name;
                this.teamId = this.team.team_id;
                EmitterService.get("currentDataset").emit(this.dataset);
                EmitterService.get("currentTeam").emit(this.team);
                EmitterService.get("currentMembers").emit(this.members);
                this.buildingComponent.loadData(this.dataset.datasetId, "", this.team.name, this.team.team_id);
            });
    }



    // toggleTag(tag: SelectableTag) {
    //     tag.isSelected = !tag.isSelected;
    //     this.selectableTags = this.dataset.tags.map(t => <SelectableTag>t) // .filter(t => t.isSelected);
    // }

    saveDetailChanges() {
        // console.log("saveDetailChanges")
        this.buildingComponent.saveChanges();
    }

    applySettings(data: { initiative: Initiative, tags: Tag[] }) {
        console.log("save settings", data.tags);
        data.initiative.traverse((node: Initiative) => {
            node.tags = _.intersectionBy(data.tags, node.tags, (t: Tag) => t.shortid);
        })

        this.saveChanges(data.initiative, data.tags)
    }

    saveChanges(initiative: Initiative, tags?: Array<Tag>) {
        console.log(initiative, tags)
        this.dataset.initiative = initiative;
        if (tags) {
            this.dataset.tags = tags;
            this.tags = tags
        }
        this.datasetFactory.upsert(this.dataset, this.datasetId)
            .then((hasSaved: boolean) => {
                this.dataService.set({ initiative: initiative, datasetId: this.datasetId, teamName: this.teamName, teamId: this.teamId, tags: this.dataset.tags });
                return hasSaved;
            }, (reason) => { console.log(reason) });

    }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }

    toggleDetailsPanel() {
        this.isDetailsPanelCollapsed = !this.isDetailsPanelCollapsed;
    }

    // toggleSettingsPanel() {
    //     this.isSettingsPanelCollapsed = !this.isSettingsPanelCollapsed;
    // }


    openDetails(node: Initiative, willCloseBuildingPanel: boolean = false) {
        this.openedNodeParent = node.getParent(this.dataset.initiative);
        this.openedNode = node;
        this.isBuildingPanelCollapsed = willCloseBuildingPanel;
        this.isDetailsPanelCollapsed = false;
    }

    addInitiative(node: Initiative) {
        // console.log("workspace.compoentn", "adding to", node.name);
        this.buildingComponent.addNodeTo(node);
    }

    removeInitiative(node: Initiative) {
        // console.log("workspace.compoentn", "remove", node.name);
        this.buildingComponent.removeNode(node);
    }

    moveInitiative({ node, from, to }: { node: Initiative, from: Initiative, to: Initiative }) {
        // console.log("workspace.compoentn", "move", node.name, "", to.name);
        this.buildingComponent.moveNode(node, from, to);
    }

    closeEditingPanel() {
        this.isDetailsPanelCollapsed = true;
        this.isBuildingPanelCollapsed = true;
    }

}