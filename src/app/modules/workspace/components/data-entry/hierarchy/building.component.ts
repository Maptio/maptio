import { User } from "../../../../../shared/model/user.data";
import { Team } from "../../../../../shared/model/team.data";
import { DatasetFactory } from "../../../../../core/http/map/dataset.factory";
import { DataService } from "../../../services/data.service";
import { Initiative } from "../../../../../shared/model/initiative.data";

import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { EventEmitter } from "@angular/core";
import { Component, ViewChild, Output, Input, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { TreeNode, TREE_ACTIONS, TreeComponent } from "angular-tree-component";

import "rxjs/add/operator/map";
import { InitiativeNodeComponent } from "../node/initiative.node.component"
import { NgbModal, NgbTabset, NgbTabChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { LoaderService } from "../../../../../shared/components/loading/loader.service";
import { Tag } from "../../../../../shared/model/tag.data";
import { DataSet } from "../../../../../shared/model/dataset.data";
import { UserService } from "../../../../../shared/services/user/user.service";
import { intersectionBy } from "lodash";
import { Subject } from "rxjs";

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
                        this.modalService.open(this.dragConfirmationModal, { centered: true }).result
                            .then(result => {
                                if (result) {
                                    this.analytics.eventTrack("Map", {
                                        action: "move", mode: "list", confirmed: true, team: this.team.name,
                                        teamId: this.team.team_id
                                    });
                                    TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to });
                                    this.updateTree();
                                    this.saveChanges()
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
    @ViewChild("tabs") public tabs: NgbTabset;

    @ViewChild(InitiativeNodeComponent)
    node: InitiativeNodeComponent;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;

    datasetId: string;

    team: Team;
    tags: Tag[];
    isFirstEdit: Boolean;
    isExpanding: boolean;
    isCollapsing: boolean;
    isToggling: boolean;

    @Input("user") user: User;
    @Input("isEmptyMap") isEmptyMap: Boolean;

    @Output("save") save: EventEmitter<{ initiative: Initiative, tags: Tag[] }> = new EventEmitter<{ initiative: Initiative, tags: Tag[] }>();
    @Output("openDetails") openDetails = new EventEmitter<Initiative>();
    @Output("forceEdit") forceEdit = new EventEmitter<void>();

    constructor(private dataService: DataService, private datasetFactory: DatasetFactory,
        private modalService: NgbModal, private analytics: Angulartics2Mixpanel, private cd: ChangeDetectorRef, private loaderService: LoaderService) {
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
        localStorage.setItem("keepEditingOpen", JSON.stringify(true));
        this.save.emit({ initiative: this.nodes[0], tags: this.tags });
    }

    state = localStorage.treeState && JSON.parse(localStorage.treeState);
    setState(state: any) {
        localStorage.treeState = JSON.stringify(state);
        this.isCollapsing = false;
        this.isExpanding = false;
        this.isToggling = false;
        this.cd.markForCheck();
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

    openNodeDetails(node: Initiative, isEditMode: boolean) {
        this.openDetails.emit(node)
        if (isEditMode) this.forceEdit.emit();
    }

    onEditingTags(tags: Tag[]) {
        this.tags = tags;
        this.nodes[0].traverse((node: Initiative) => {
            node.tags = intersectionBy(tags, node.tags, (t: Tag) => t.shortid);
        })
        this.saveChanges();
    }

    moveNode(node: Initiative, from: Initiative, to: Initiative) {
        let foundTreeNode = this.tree.treeModel.getNodeById(node.id)
        let foundToNode = this.tree.treeModel.getNodeById(to.id);
        TREE_ACTIONS.MOVE_NODE(this.tree.treeModel, foundToNode, {}, { from: foundTreeNode, to: { parent: foundToNode } })

    }

    removeNode(node: Initiative) {

        let hasFoundNode: boolean = false;
        let parent ;

        let index = this.nodes[0].children.findIndex(c => c.id === node.id);
        if (index > -1) {
            this.nodes[0].children.splice(index, 1);
            parent = this.nodes[0];
        }
        else {
            this.nodes[0].traverse(n => {
                if (hasFoundNode) return;
                let index = n.children.findIndex(c => c.id === node.id);
                if (index > -1) {
                    hasFoundNode = true;
                    n.children.splice(index, 1);
                    parent = n;
                }
            });
        }
        
        this.saveChanges();
        this.updateTree();
        localStorage.setItem("node_id", parent.id); // sp that the map refreshes focused on parent node instead of zooming out
    }

    addNodeTo(node: Initiative, subNode: Initiative) {

        const addNode = (parent: Initiative, child: Initiative) => {
            let newNode = child;
            newNode.children = []
            newNode.team_id = node.team_id;
            newNode.hasFocus = true;
            newNode.id = Math.floor(Math.random() * 10000000000000);
            parent.children = parent.children || [];
            parent.children.unshift(newNode);
            this.saveChanges();
            this.updateTree();
            this.openNodeDetails(newNode, true);
        }

        let hasFoundNode: boolean = false;
        if (this.nodes[0].id === node.id) {
            hasFoundNode = true;
            addNode(this.nodes[0], subNode);
        }
        else {
            this.nodes[0].traverse(n => {
                if (hasFoundNode) return;
                if (n.id === node.id) {
                    hasFoundNode = true;
                    addNode(n, subNode);

                }
            });
        }
    }

    addRootNode() {
        this.addNodeTo(this.nodes[0], new Initiative())
    }

    toggleAll(isExpand: boolean) {
        if (this.isToggling) return;
        this.isToggling = true;
        this.isExpanding = isExpand === true;
        this.isCollapsing = isExpand === false;
        this.cd.markForCheck();

        setTimeout(() => {
            isExpand
                ? this.tree.treeModel.expandAll()
                : this.tree.treeModel.collapseAll();
        }, 100);


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
        this.tags = dataset.tags;
        return this.datasetFactory.getWithUsers(dataset.datasetId, members)
            .then(dataset => {
                this.nodes = [];
                this.nodes.push(dataset.initiative);
            })
            .then(() => {
                this.loaderService.hide();
            })
    }
}


