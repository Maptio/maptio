import { User } from "./../../shared/model/user.data";
import { UserFactory } from "./../../shared/services/user.factory";
import { Angulartics2Mixpanel } from "angulartics2";
import { EventEmitter } from "@angular/core";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { DataSet } from "./../../shared/model/dataset.data";
import { Initiative } from "./../../shared/model/initiative.data";
import { Component, ViewChild, Output, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { TreeNode, IActionMapping, TREE_ACTIONS, TreeModel, TreeComponent } from "angular-tree-component";
import { DataService } from "../../shared/services/data.service";
import "rxjs/add/operator/map";
import { InitiativeNodeComponent } from "./initiative.node.component"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Tag } from "../../shared/model/tag.data";

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
                dragStart: () => { console.log("drg start"); this.cd.detach(); },
                dragEnd: () => { console.log("drg end"); this.cd.reattach(); },
                drop: (tree: any, node: TreeNode, $event: any, { from, to }: { from: TreeNode, to: TreeNode }) => {
                    console.log("drop")
                    this.fromInitiative = from.data;
                    this.toInitiative = to.parent.data;

                    if (from.parent.id === to.parent.id) { // if simple reordering, we dont ask for confirmation
                        this.analytics.eventTrack("Map", { action: "move", mode: "list", confirmed: true });
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to })
                    }
                    else {
                        this.modalService.open(this.dragConfirmationModal).result
                            .then(result => {
                                if (result) {
                                    this.analytics.eventTrack("Map", { action: "move", mode: "list", confirmed: true });
                                    TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to })
                                }
                                else {
                                    this.analytics.eventTrack("Initiative", { action: "move", mode: "list", confirm: false });
                                }
                            })
                            .catch(reason => { });
                    }

                }
            }
        }
    }

    SAVING_FREQUENCY: number = 10;


    @ViewChild("tree") public tree: TreeComponent;

    @ViewChild(InitiativeNodeComponent)
    node: InitiativeNodeComponent;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;

    datasetId: string;

    teamName: string;
    teamId: string;

    @Output("save") save = new EventEmitter<Initiative>();
    @Output("openDetails") openDetails = new EventEmitter<Initiative>();
    @Output("openDetailsEditOnly") openDetailsEditOnly = new EventEmitter<Initiative>();

    constructor(private dataService: DataService, private datasetFactory: DatasetFactory,
        private modalService: NgbModal, private analytics: Angulartics2Mixpanel,
        private userFactory: UserFactory, private cd: ChangeDetectorRef) {
        // this.nodes = [];
    }

    saveChanges() {
        // console.log("send to workspace", this.nodes[0])
        this.save.emit(this.nodes[0]);
    }

    state = localStorage.treeState && JSON.parse(localStorage.treeState);
    setState(state: any) {
        localStorage.treeState = JSON.stringify(state);
    }

    isRootValid(): boolean {
        return (this.nodes[0].name !== undefined) && this.nodes[0].name.trim().length > 0;
    }

    updateTreeModel(treeModel: any) {
        treeModel.update();
    }

    updateTree() {
        this.tree.treeModel.update();
    }

    openNodeDetails(node: Initiative) {
        this.openDetails.emit(node)
    }

    moveNode(node: Initiative, from: Initiative, to: Initiative) {
        let foundTreeNode = this.tree.treeModel.getNodeById(node.id)
        let foundToNode = this.tree.treeModel.getNodeById(to.id);
        TREE_ACTIONS.MOVE_NODE(this.tree.treeModel, foundToNode, {}, { from: foundTreeNode, to: { parent: foundToNode } })

    }


    removeNode(node: Initiative) {

        let hasFoundNode: boolean = false;

        let index = this.nodes[0].children.findIndex(c => c.id === node.id);
        if (index > -1) {
            this.nodes[0].children.splice(index, 1);
        }
        else {
            this.nodes[0].traverse(n => {
                if (hasFoundNode) return;
                let index = n.children.findIndex(c => c.id === node.id);
                if (index > -1) {
                    hasFoundNode = true;
                    n.children.splice(index, 1);
                }
            });
        }

        this.saveChanges();
        this.updateTree()
    }

    addNodeTo(node: Initiative) {
        let hasFoundNode: boolean = false;
        if (this.nodes[0].id === node.id) {
            hasFoundNode = true;
            let newNode = new Initiative();
            newNode.children = [];
            newNode.team_id = node.team_id;
            newNode.hasFocus = true;
            newNode.id = Math.floor(Math.random() * 10000000000000);
            // console.log("new node", Math.ceil(node.id * Math.random()));
            this.nodes[0].children = this.nodes[0].children || [];
            this.nodes[0].children.unshift(newNode);
            this.openDetailsEditOnly.emit(newNode)
        }
        else {
            this.nodes[0].traverse(n => {
                if (hasFoundNode) return;
                if (n.id === node.id) {
                    hasFoundNode = true;
                    let newNode = new Initiative();
                    newNode.children = []
                    newNode.team_id = node.team_id;
                    newNode.hasFocus = true;
                    newNode.id = Math.floor(Math.random() * 10000000000000);
                    // console.log("new node", Math.ceil(node.id * Math.random()));
                    n.children = n.children || [];
                    n.children.unshift(newNode);
                    this.openDetailsEditOnly.emit(newNode)
                }
            });
        }

        this.saveChanges();
        this.updateTree()
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
    loadData(datasetID: string, nodeIdToOpen: string = undefined, teamName: string, teamId: string): Promise<void> {
        this.datasetId = datasetID;
        this.teamId = teamId;
        this.teamName = teamName;
        return this.datasetFactory.get(datasetID)
            .then(dataset => {
                this.nodes = [];
                this.nodes.push(dataset.initiative);
                let defaultTeamId = this.nodes[0].team_id;
                this.nodes[0].traverse(function (node: Initiative) {
                    node.team_id = defaultTeamId; // For now, the sub initiative are all owned by the same team
                });
            })
            .then(() => {
                let queue = this.nodes[0].traversePromise(function (node: Initiative) {
                    let q: any = [];
                    if (node.accountable) {
                        q += this.userFactory.get(node.accountable.user_id).then((u: User) => {
                            node.accountable.picture = u.picture;
                            node.accountable.name = u.name
                        }, () => { return Promise.reject("No user") }).catch(() => { })
                    }
                    if (node.helpers) {
                        node.helpers.forEach(h => {
                            return this.userFactory.get(h.user_id).then((u: User) => {
                                h.picture = u.picture;
                                h.name = u.name
                            }, () => { return Promise.reject("No user") }).catch(() => { })
                        })
                    }


                }.bind(this));
                return Promise.all(queue).then(t => t).catch(() => { })
            })
            .then(() => {
                this.saveChanges();
            })
            .then(() => {
                let targetNode: Initiative = undefined;
                if (nodeIdToOpen) {

                    this.nodes[0].traverse(n => {
                        if (targetNode) return; // once we find it, we dont need to carry on
                        if (n.id.toString() === nodeIdToOpen) {
                            targetNode = n;
                        }
                    });
                }
                if (targetNode) {
                    this.openDetailsEditOnly.emit(targetNode)
                }
            })
    }

    filterNodes(treeModel: any, searched: string) {
        this.analytics.eventTrack("Search map", { search: searched, teamId: this.teamId });
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


