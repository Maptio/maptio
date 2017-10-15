import { User } from "./../../shared/model/user.data";
import { UserFactory } from "./../../shared/services/user.factory";
import { Angulartics2, Angulartics2Mixpanel } from "angulartics2";
import { EventEmitter } from "@angular/core";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { DataSet } from "./../../shared/model/dataset.data";
import { Initiative } from "./../../shared/model/initiative.data";
import { Observable } from "rxjs/Rx";
import { EmitterService } from "./../../shared/services/emitter.service";
import { Component, ViewChild, Output } from "@angular/core";
import { InitiativeComponent } from "../initiative/initiative.component";
import { TreeNode, IActionMapping, TREE_ACTIONS } from "angular-tree-component";
import { DataService } from "../../shared/services/data.service";
import "rxjs/add/operator/map";
import { InitiativeNodeComponent } from "./initiative.node.component"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "building",
    templateUrl: "./building.component.html",
    styleUrls: ["./building.component.css"]
})
export class BuildingComponent {

    searched: string;
    nodes: Array<Initiative>;

    fromInitiative: Initiative;
    toInitiative: Initiative;


    options = {
        allowDrag: (node: TreeNode) => node.data.isDraggable,
        allowDrop: true,
        nodeHeight: 55,
        actionMapping: {
            mouse: {
                drop: (tree: any, node: TreeNode, $event: any, { from, to }: { from: TreeNode, to: TreeNode }) => {
                    this.fromInitiative = from.data;
                    this.toInitiative = to.parent.data;

                    // console.log(from.parent.id, to.parent.id)
                    if (from.parent.id === to.parent.id) { // if simple reordering, we dont ask for confirmation
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to })
                    }
                    else {
                        this.modalService.open(this.dragConfirmationModal).result
                            .then(result => {
                                if (result) {
                                    TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to })
                                }
                            })
                            .catch(reason => { });
                    }

                }
            }
        }
    }

    SAVING_FREQUENCY: number = 10;

    // @ViewChild(TreeComponent)
    // tree: TreeComponent;

    @ViewChild(InitiativeNodeComponent)
    node: InitiativeNodeComponent;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;

    datasetId: string;

    @Output("save") save = new EventEmitter<Initiative>();
    @Output("openDetails") openDetails = new EventEmitter<Initiative>();

    constructor(private dataService: DataService, private datasetFactory: DatasetFactory,
        private modalService: NgbModal, private analytics: Angulartics2Mixpanel,
        private userFactory: UserFactory) {
        // this.nodes = [];
    }



    saveChanges() {
        // console.log("send to workspace", this.nodes[0])
        this.save.emit(this.nodes[0]);

        // this.dataService.set({ initiative: this.nodes[0], datasetId: this.datasetId });
    }

    isRootValid(): boolean {
        return (this.nodes[0].name !== undefined) && this.nodes[0].name.trim().length > 0;
    }

    updateTreeModel(treeModel: any) {
        treeModel.update();
    }

    openNodeDetails(node: Initiative) {
        this.openDetails.emit(node)
    }

    // toggleAll() {
    //     this.tree.treeModel.getNodeById(this.nodes[0].id).toggleExpanded();
    //     this.nodes[0].traverse(function (i: Initiative) {
    //         this.tree.treeModel.getNodeById(i.id).toggleExpanded();
    //     }.bind(this));
    // }

    /**
     * Loads data into workspace
     * @param id Dataset Id
     * @param slugToOpen Slug of initiative to open
     */
    loadData(id: string): Promise<void> {

        return this.datasetFactory.get(id)
            .then(data => {
                this.datasetId = id;
                this.nodes = [];
                this.nodes.push(new DataSet().deserialize(data).initiative);

                let defaultTeamId = this.nodes[0].team_id;
                this.nodes[0].traverse(function (node: Initiative) {
                    node.team_id = defaultTeamId; // For now, the sub initiative are all owned by the same team
                });

            })
            .then(() => {
                let queue = this.nodes[0].traversePromise(function (node: Initiative) {
                    return this.userFactory.get(node.accountable ? node.accountable.user_id : undefined).then((u: User) => {
                        node.accountable.picture = u.picture;
                        return u.picture;
                    }, () => { return Promise.reject("No user") }).catch(() => { })
                }.bind(this));
                return Promise.all(queue).then(t => t).catch(() => { })
            })
            .then(() => {
                this.saveChanges();
            })
    }

    filterNodes(treeModel: any, searched: string) {
        this.analytics.eventTrack("Search map", { search: searched });
        if (!searched || searched === "") {
            treeModel.clearFilter();
        }
        else {
            this.nodes.forEach(function (i: Initiative) {
                i.traverse(function (node) { node.isSearchedFor = false });
            });
            treeModel.filterNodes(
                (node: TreeNode) => {
                    let initiative = (<Initiative>node.data);
                    initiative.isSearchedFor = initiative.search(searched);
                    return initiative.isSearchedFor;
                    // }

                },
                true);
        }
        // console.log("filterNodes")
        this.saveChanges();
    }

}


