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

@Component({
    selector: "workspace",
    templateUrl: "workspace.component.html",
    styleUrls: ["./workspace.component.css"],
    animations: [
        trigger("fadeInOut", [
            state("in", style({
                opacity: 1, visibility: "visible", display: "inline"
            })),
            state("out", style({ opacity: 0.5, visibility: "hidden", display: "none" })),
            transition("in <=> out", [
                animate("1s ease-out")
            ])
        ])
    ]
})


export class WorkspaceComponent implements OnInit, OnDestroy {

    @ViewChild("building")
    buildingComponent: BuildingComponent

    public isBuildingPanelCollapsed: boolean = true;
    public isDetailsPanelCollapsed: boolean = true;
    private datasetId: string;
    private routeSubscription: Subscription;
    private userSubscription: Subscription;

    public dataset: DataSet;
    public members: Array<User>;
    public team: Team;
    public teams: Team[];

    public openedNode: Initiative;
    public openedNodeParent: Initiative;
    public openedNodeTeamId: string;

    public mapped: Initiative;
    teamName: string;
    teamId: string;
    isPictureLoadedMap: Map<string, boolean> = new Map<string, boolean>();
    isFadeInMap: Map<string, string> = new Map<string, string>();
    isFadeOutMap: Map<string, string> = new Map<string, string>();

    private _placeHolderSafe: SafeUrl;
    private _imgSafe: SafeUrl;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;

    // constructor(private auth: Auth, private route: ActivatedRoute, private datasetFactory: DatasetFactory, private dataService: DataService,
    //     private teamFactory: TeamFactory, private userFactory: UserFactory, private userService: UserService, private modalService: NgbModal) {
    // }

    ngOnDestroy(): void {
        EmitterService.get("currentDataset").emit(undefined)
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }

    constructor(private route: ActivatedRoute, private datasetFactory: DatasetFactory,
        private dataService: DataService, private sanitizer: DomSanitizer, private cd: ChangeDetectorRef) {
    }

    ngOnInit() {



        this.routeSubscription = this.route.data
            .subscribe((data: { data: { dataset: DataSet, team: Team, members: User[] } }) => {
                this.dataset = data.data.dataset;
                this.team = data.data.team;
                this.members = data.data.members;
                this.datasetId = this.dataset._id;
                this.teamName = this.team.name;
                this.teamId = this.team.team_id;
                EmitterService.get("currentDataset").emit(this.dataset);
                this.buildingComponent.loadData(this.dataset._id, "", this.team.name, this.team.team_id);


                this.members.forEach(m => {
                    this.isPictureLoadedMap.set(m.user_id, false);
                    this.isFadeInMap.set(m.user_id, "in");
                    this.isFadeOutMap.set(m.user_id, "out")
                })
                // this._placeHolderSafe = this.sanitizer.bypassSecurityTrustUrl(this._placeholderBase64);
                this._imgSafe = this.sanitizer.bypassSecurityTrustUrl("/assets/images/user.jpg");
            });
    }

    public isPictureLoaded(user_id: string) {
        this.isPictureLoadedMap.set(user_id, true);
        this.isFadeInMap.set(user_id, "out");
        this.isFadeOutMap.set(user_id, "in");
        this.cd.markForCheck();
    }

    public get image() {
        return this._imgSafe;
    }

    saveDetailChanges() {
        // console.log("saveDetailChanges")
        this.buildingComponent.saveChanges();
    }

    saveChanges(initiative: Initiative) {
        // console.log("initiative", initiative);

        this.datasetFactory.upsert(new DataSet({ _id: this.datasetId, initiative: initiative }), this.datasetId)
            .then((hasSaved: boolean) => {
                // console.log("seding change to mapping")
                this.dataService.set({ initiative: initiative, datasetId: this.datasetId, teamName: this.teamName, teamId: this.teamId });
                return hasSaved;
            }, (reason) => { console.log(reason) });
        // .then(() => {
        //     this.dataset$ = this.datasetFactory.get(this.datasetId)
        // });

    }

    // addTeamToInitiative(team: Team) {
    //     this.modalService.open(this.dragConfirmationModal).result.then((result: boolean) => {
    //         if (result) {
    //             this.isBuildingPanelCollapsed = true;
    //             this.isDetailsPanelCollapsed = true;
    //             this.team$ = this.dataset$.then((dataset: DataSet) => {
    //                 dataset.initiative.team_id = team.team_id;
    //                 this.datasetFactory.upsert(dataset, dataset._id).then(() => {
    //                     this.buildingComponent.loadData(dataset._id);
    //                 })
    //                 return team;
    //             });
    //             this.updateTeamMembers();
    //         }
    //     })
    //         .catch(reason => { });



    // }

    // updateTeamMembers() {
    //     this.isBuildingPanelCollapsed = true;
    //     this.isDetailsPanelCollapsed = true;
    //     this.members = this.team$
    //         .then((team: Team) => {
    //             if (team)
    //                 return team.members;
    //         });
    // }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }

    toggleDetailsPanel() {
        this.isDetailsPanelCollapsed = !this.isDetailsPanelCollapsed;
    }


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