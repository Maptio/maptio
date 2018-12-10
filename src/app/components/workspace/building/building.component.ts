import { User } from "./../../../shared/model/user.data";
import { Team } from "./../../../shared/model/team.data";
import { UserFactory } from "./../../../shared/services/user.factory";
import { DatasetFactory } from "./../../../shared/services/dataset.factory";
import { DataService } from "./../../../shared/services/data.service";
import { Initiative } from "./../../../shared/model/initiative.data";

import { Angulartics2Mixpanel } from "angulartics2";
import { EventEmitter } from "@angular/core";
import { Component, ViewChild, Output, Input, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { TreeNode, TREE_ACTIONS, TreeComponent } from "angular-tree-component";

import "rxjs/add/operator/map";
import { InitiativeNodeComponent } from "./initiative.node.component"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LoaderService } from "../../../shared/services/loading/loader.service";
import { Tag } from "../../../shared/model/tag.data";
import { DataSet } from "../../../shared/model/dataset.data";
import { UserService } from "../../../shared/services/user/user.service";

@Component({
    selector: "building",
    templateUrl: "./building.component.html",
    styleUrls: ["./building.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildingComponent {

    searched: string;
    nodes: Array<Initiative>;

    fromInitiative: Initiative;
    toInitiative: Initiative;


    options = {
        allowDrag: (node: TreeNode) => node.data.isDraggable,
        allowDrop: (element: any, to: { parent: any, index: number }) => {
            return to.parent.parent !== null;
        },
        nodeClass: (node: TreeNode) => {
            return node.isRoot ? 'node-root' : "";
        },
        nodeHeight: 55,
        actionMapping: {
            mouse: {
                dragStart: () => { this.cd.detach(); },
                dragEnd: () => { this.cd.reattach(); },
                drop: (tree: any, node: TreeNode, $event: any, { from, to }: { from: TreeNode, to: TreeNode }) => {

                    this.fromInitiative = from.data;
                    this.toInitiative = to.parent.data;

                    if (from.parent.id === to.parent.id) { // if simple reordering, we dont ask for confirmation
                        this.analytics.eventTrack("Map", {
                            action: "move", mode: "list", confirmed: true, team: this.team.name,
                            teamId: this.team.team_id
                        });
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to })
                    }
                    else {
                        this.modalService.open(this.dragConfirmationModal).result
                            .then(result => {
                                if (result) {
                                    this.analytics.eventTrack("Map", {
                                        action: "move", mode: "list", confirmed: true, team: this.team.name,
                                        teamId: this.team.team_id
                                    });
                                    TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to })
                                }
                                else {
                                    this.analytics.eventTrack("Initiative", {
                                        action: "move", mode: "list", confirm: false, team: this.team.name,
                                        teamId: this.team.team_id
                                    });
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

    team: Team;
    isFirstEdit: Boolean;

    @Input("user") user: User;
    @Input("isEmptyMap") isEmptyMap: Boolean;
    @Output("save") save = new EventEmitter<Initiative>();
    @Output("openDetails") openDetails = new EventEmitter<Initiative>();
    @Output("openDetailsEditOnly") openDetailsEditOnly = new EventEmitter<Initiative>();

    constructor(private dataService: DataService, private datasetFactory: DatasetFactory,
        private modalService: NgbModal, private analytics: Angulartics2Mixpanel,
        private userFactory: UserFactory, private userService:UserService, private cd: ChangeDetectorRef, private loaderService: LoaderService) {
        // this.nodes = [];
    }


    ngAfterViewChecked() {
        try {
            const someNode = this.tree.treeModel.getFirstRoot();
            someNode.expand()
        }
        catch (e) {

        }
    }

    saveChanges() {
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
        // this will saveChanges() on the callback 
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

        // this.saveChanges();
        this.updateTree()
    }

    addNodeTo(node: Initiative, subNode:Initiative) {
        let hasFoundNode: boolean = false;
        if (this.nodes[0].id === node.id) {
            hasFoundNode = true;
            let newNode = subNode;
            newNode.children = [];
            newNode.team_id = node.team_id;
            newNode.hasFocus = true;
            newNode.id = Math.floor(Math.random() * 10000000000000);
            this.nodes[0].children = this.nodes[0].children || [];
            this.nodes[0].children.unshift(newNode);
            // this.openDetails.emit(newNode)
        }
        else {
            this.nodes[0].traverse(n => {
                if (hasFoundNode) return;
                if (n.id === node.id) {
                    hasFoundNode = true;
                    let newNode = subNode;
                    newNode.children = []
                    newNode.team_id = node.team_id;
                    newNode.hasFocus = true;
                    newNode.id = Math.floor(Math.random() * 10000000000000);
                    n.children = n.children || [];
                    n.children.unshift(newNode);
                    // this.openDetails.emit(newNode)
                }
            });
        }

        // this.saveChanges();
        this.updateTree()
    }

    addRootNode() {
        this.addNodeTo(this.nodes[0], new Initiative())
    }

    toggleAll(isExpand: boolean) {
        isExpand
            ? this.tree.treeModel.expandAll()
            : this.tree.treeModel.collapseAll();
    }

    /**
     * Loads data into workspace
     * @param id Dataset Id
     * @param slugToOpen Slug of initiative to open
     */
    loadData(dataset: DataSet, team: Team, members: User[]): Promise<void> {
        this.loaderService.show();
        this.datasetId = dataset.datasetId;
        this.team = team;
        return this.datasetFactory.get(dataset.datasetId)
            .then(dataset => {
                this.nodes = [];
                this.nodes.push(dataset.initiative);
                let defaultTeamId = this.nodes[0].team_id;
                this.nodes[0].traverse(function (node: Initiative) {
                    node.team_id = defaultTeamId; // For now, the sub initiative are all owned by the same team
                });

                return Promise.all([this.userService.getUsersInfo(team.members), this.userFactory.getUsers(team.members.map(m => m.user_id))])
                .then(([auth0Users, databaseUsers]: [User[], User[]]) => {
                    // console.log(auth0Users, databaseUsers)
                    return databaseUsers.map(u => {
                        u.picture = auth0Users.find(du => du.user_id === u.user_id) ? auth0Users.find(du => du.user_id === u.user_id).picture : u.picture;
                       return u;
                    })
                })

            })
            .then((users: User[]) => {
                let queue = this.nodes[0].traversePromise(function (node: Initiative) {
                    let q: any = [];
                    if (node.accountable) {
                        q += new Promise(() => {
                            let a = users.find(u => u.user_id === node.accountable.user_id);
                            if (a) {
                                node.accountable.picture = a.picture;
                                node.accountable.name = a.name
                                node.accountable.shortid = a.shortid;
                            }

                        })
                    }
                    if (node.helpers) {
                        node.helpers.forEach(helper => {
                            q += new Promise(() => {
                                let h = users.find(u => u.user_id === helper.user_id);
                                if (h) {
                                    helper.picture = h.picture;
                                    helper.name = h.name;
                                    helper.shortid = h.shortid;
                                }
                            })
                        })
                    }
                }.bind(this));

                return Promise.all(queue).then(t => t).catch(() => { });
            })
            .then(() => {
                this.dataService.set({
                    initiative: this.nodes[0],
                    dataset: dataset,
                    team: this.team,
                    members: members
                });

                this.cd.markForCheck();
            })
            .then(() => {
                this.loaderService.hide();
            })
    }
}


