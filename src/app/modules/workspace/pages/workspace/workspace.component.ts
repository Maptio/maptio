import { BuildingComponent } from "../../components/data-entry/hierarchy/building.component";
import { DataService, CounterService } from "../../services/data.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription, Subject, ReplaySubject, Observable, BehaviorSubject } from "rxjs/Rx";
import { Initiative } from "../../../../shared/model/initiative.data";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Team } from "../../../../shared/model/team.data";
import { EmitterService } from "../../../../core/services/emitter.service";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { ViewChild } from "@angular/core";
import {
    Component, OnInit, OnDestroy,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "../../../../shared/model/user.data";
import { Tag } from "../../../../shared/model/tag.data";
import { Intercom } from "ng-intercom";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { intersectionBy } from "lodash";
import { SafeStyle } from "@angular/platform-browser";
import { UIService } from "../../services/ui.service";
import { Permissions } from "../../../../shared/model/permission.data";
import { MapSettingsService } from "../../services/map-settings.service";

@Component({
    selector: "workspace",
    templateUrl: "workspace.component.html",
    styleUrls: ["./workspace.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class WorkspaceComponent implements OnInit, OnDestroy {

    Permissions = Permissions;
    @ViewChild("building")
    buildingComponent: BuildingComponent

    public isBuildingPanelCollapsed: boolean = true;
    public isDetailsPanelCollapsed: boolean = true;
    public isTagsPanelCollapsed: boolean = true;
    public visiblePanelName: string;

    public isBuildingVisible: boolean = true;
    public isEmptyMap: Boolean;
    public isBackToBuildingVisible: boolean;
    public isSaving: Boolean;
    public isEditMode: boolean;
    public isNoSearchResults: boolean;
    // public isSettingsPanelCollapsed: boolean = true;
    public datasetId: string;
    private routeSubscription: Subscription;
    private userSubscription: Subscription;
    public isLoading: boolean;
    public cancelClicked: boolean;

    public dataset: DataSet;
    public members: Array<User>;
    public team: Team;
    public teams: Team[];
    public tags: Tag[];
    public user: User;
    public canvasYMargin: number;
    public canvasHeight: number

    public openedNode: Initiative;
    public openedUser: User;
    public openedNodeParent: Initiative;
    public openedNodeTeamId: string;
    public openEditTag$: Subject<void> = new Subject<void>();
    public isSidebarClosed: boolean;
    public margin: SafeStyle;

    public selectableTags$: Subject<Tag[]> = new BehaviorSubject<Tag[]>([]);
    public selectableUsers$: Subject<User[]> = new BehaviorSubject<User[]>([]);
    public mapColor$: Subject<string> = new BehaviorSubject<string>("");
    public zoomInitiative$: Subject<Initiative> = new ReplaySubject<Initiative>();

    public mapped: Initiative;
    teamName: string;
    teamId: string;
    isFullSidebar: boolean;
    selectableTags: Array<Tag>;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;


    ngOnDestroy(): void {
        EmitterService.get("currentTeam").emit(undefined)
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }

    constructor(private route: ActivatedRoute, private datasetFactory: DatasetFactory,
        private uiService: UIService,private settingsService:MapSettingsService,
        private dataService: DataService, private cd: ChangeDetectorRef, private mixpanel: Angulartics2Mixpanel, private intercom: Intercom) {
    }

    ngOnInit() {
        this.margin = this.uiService.getCanvasMargin();
        this.isLoading = true;
        this.cd.markForCheck();

        this.routeSubscription = this.route.data
            .do((data) => {
                this.isLoading = true;
                this.cd.markForCheck();

                if (this.datasetId && data.data.dataset.datasetId !== this.datasetId) {
                    debugger
                    localStorage.removeItem("node_id");
                    localStorage.removeItem("user_id");
                    this.selectableUsers$.next([]);
                    this.selectableTags$.next([]);
                    let mapColor = this.settingsService.get(data.data.dataset.datasetId).mapColor;
                    this.mapColor$.next(mapColor);
                    this.closeAllPanels();
                    this.uiService.clean();
                }
            })
            .do((data: { data: { dataset: DataSet, team: Team, members: User[], user: User } }) => {

                this.updateInitiativeTree(data.data.dataset, data.data.team, data.data.members);
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
                this.dataService.set({
                    initiative: this.dataset.initiative,
                    dataset: this.dataset,
                    team: this.team,
                    members: this.members,
                    user: this.user
                });
                EmitterService.get("currentTeam").emit(this.team);
                this.isEmptyMap = !this.dataset.initiative.children || this.dataset.initiative.children.length === 0;
                this.isLoading = false;
                this.cd.markForCheck();
            });
    }

    updateInitiativeTree(dataset: DataSet, team: Team, members: User[]) {
        this.buildingComponent.loadData(dataset, team, members);
    }


    saveDetailChanges() {
        localStorage.removeItem("keepEditingOpen");
        // only save initiative as tags are not modified
        // dataset is "auto-magically" bound here to changes inside initiative
        this.saveChanges({ initiative: this.dataset.initiative, tags: this.tags })
    }

    saveChanges(change: { initiative: Initiative, tags: Array<Tag> }) {
        this.isEmptyMap = !change.initiative.children || change.initiative.children.length === 0;
        this.isSaving = true;
        this.cd.markForCheck();

        this.dataset.initiative = change.initiative;
        this.dataset.tags = change.tags;
        this.tags = change.tags

        let depth = 0
        change.initiative.traverse((node) => {
            depth++;
            node.tags = intersectionBy(change.tags, node.tags, (t: Tag) => t.shortid)
        });

        this.datasetFactory.upsert(this.dataset, this.datasetId)
            .then((hasSaved: boolean) => {
                this.dataService.set({ initiative: change.initiative, dataset: this.dataset, team: this.team, members: this.members, user: this.user });
                return hasSaved;
            }, (reason) => { console.error(reason) })
            .then(() => {
                this.updateInitiativeTree(this.dataset, this.team, this.members)
            })
            .then(() => {
                this.intercom.trackEvent("Editing map", { team: this.team.name, teamId: this.team.team_id, datasetId: this.datasetId, mapName: change.initiative.name, circles: depth });
                this.mixpanel.eventTrack("Editing map", { team: this.team.name, teamId: this.team.team_id, datasetId: this.datasetId, mapName: change.initiative.name, circles: depth });
                return;
            })
            .then(() => {
                this.isSaving = false;
                this.cd.markForCheck();
            });
    }

    onSelectMembers(members: User[]) {
        this.isNoSearchResults = false;
        this.cd.markForCheck();
        this.selectableUsers$.next(members);
        // this.onOpenUserSummary(members[0]);
    }

    onSelectTags(tags: Tag[]) {
        this.isNoSearchResults = false;
        this.cd.markForCheck();
        this.selectableTags$.next(tags);
    }

    onChangeColor(color:string){
        this.mapColor$.next(color);
    }

    onSelectInitiative(node: Initiative) {
        this.isNoSearchResults = false;
        this.cd.markForCheck();
        this.zoomInitiative$.next(node);
    }


    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.cd.markForCheck();
    }

    onEditingTags(tags: Tag[]) {
        localStorage.setItem("keepEditingOpen", JSON.stringify(true));
        this.saveChanges({ initiative: this.dataset.initiative, tags: tags })
    }

    onOpenDetails(node: Initiative) {
        this.openedNode = node;
        this.openedUser = null;
        if (this.isDetailsPanelCollapsed) this.openDetailsPanel();
        this.cd.markForCheck();
    }
    onNoSearchResults() {
        this.isFullSidebar = false;
        this.isNoSearchResults = true;
        this.cd.markForCheck();
    }

    onOpenUserSummary(user: User) {
        this.openedUser = user;
        this.openedNode = null;
        if (this.isDetailsPanelCollapsed) this.openDetailsPanel();
        this.cd.markForCheck();
    }

    addInitiative(data: { node: Initiative, subNode: Initiative }) {
        this.buildingComponent.addNodeTo(data.node, data.subNode);
    }

    addInitiativeTo(node: Initiative) {
        this.buildingComponent.addNodeTo(node, new Initiative());
    }

    removeInitiative(node: Initiative) {
        this.buildingComponent.removeNode(node);
    }

    moveInitiative({ node, from, to }: { node: Initiative, from: Initiative, to: Initiative }) {
        this.buildingComponent.moveNode(node, from, to);
    }

    openDetailsPanel() {
        this.isDetailsPanelCollapsed = false;
        this.isBuildingPanelCollapsed = true;
        this.isTagsPanelCollapsed = true;
        this.isFullSidebar = true;
        this.cd.markForCheck();

    }

    openTagsPanel() {
        this.isTagsPanelCollapsed = false;
        this.isDetailsPanelCollapsed = true;
        this.isBuildingPanelCollapsed = true;
        this.isFullSidebar = true;
        this.visiblePanelName = "Tags";
        this.cd.markForCheck();

    }

    closeAllPanels() {
        this.isFullSidebar = false;
        this.isDetailsPanelCollapsed = true;
        this.isBuildingPanelCollapsed = true;
        this.isTagsPanelCollapsed = true;
        this.cd.markForCheck();
    }

    closeDetailsPanel() {
        this.isDetailsPanelCollapsed = true;
        this.cd.markForCheck();
    }

    closeBuildingPanel() {
        this.isBuildingPanelCollapsed = true;
        this.cd.markForCheck();
    }

    openBuildingPanel() {
        this.isBuildingPanelCollapsed = false;
        this.isDetailsPanelCollapsed = true;
        this.isTagsPanelCollapsed = true;
        this.isFullSidebar = true;
        this.visiblePanelName = "Circles hierarchy";
        // this.resizeMap();
        this.cd.markForCheck();
    }

    toggleEditingPanelsVisibility(isVisible: boolean) {
        this.isBuildingVisible = isVisible;
        this.cd.markForCheck();
    }

    onEditTags() {
        this.openTagsPanel();
    }

    private isZeroPanelOpened() {
        return this.isBuildingPanelCollapsed && this.isDetailsPanelCollapsed;
    }

    public isOnePanelOpened() {
        return this.isBuildingPanelCollapsed || this.isDetailsPanelCollapsed || this.isTagsPanelCollapsed;
    }

    private isTwoPanelsOpened() {
        return !this.isDetailsPanelCollapsed && !this.isBuildingPanelCollapsed;
    }

    onOpenSlackShare() {

    }


}