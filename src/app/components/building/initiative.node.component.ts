import { ActivatedRouteSnapshot, ActivatedRoute } from "@angular/router";
import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { TreeNode, TreeModel } from "angular-tree-component";
import { Initiative } from "../../shared/model/initiative.data";
import { InitiativeComponent } from "../initiative/initiative.component";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2/dist";

@Component({
    selector: "initiative-node",
    templateUrl: "./initiative.node.component.html",
    styleUrls: ["./initiative.node.component.css"]
})
export class InitiativeNodeComponent {

    PLACEMENT: string = "top";
    TOGGLE: string = "tooltip";
    TOOLTIP_ADD: string = "Add sub-initiative"

    @Input() node: TreeNode;
    @Input() datasetId: string;
    @Input("teamName") teamName: string;
    @Input("teamId") teamId: string;

    @Output("edited") edited = new EventEmitter<boolean>();
    @Output("update") updateTreeEvent = new EventEmitter<TreeModel>();
    @Output("open") open = new EventEmitter<Initiative>();
    @Output("add") add = new EventEmitter<Initiative>();

    @ViewChild("initiative")
    editInitiative: InitiativeComponent;

    private snapshotRoute: ActivatedRouteSnapshot

    constructor(private route: ActivatedRoute
    ) {
        this.snapshotRoute = route.snapshot;
    }


    isRoot(): boolean {
        return this.node.isRoot;
    }

    hasChildren(): boolean {
        return this.node.hasChildren;
    }

    isExpanded(): boolean {
        return this.node.isExpanded;
    }

    toggleNode(initiative: Initiative) {
        this.node.treeModel.getNodeById(initiative.id).toggleExpanded();
    }

    saveNodeName(newName: any, initiative: Initiative) {
        initiative.name = newName;
        this.edited.emit(true)
    }

    addChildNode(initiative: Initiative) {
        let treeNode = this.node.treeModel.getNodeById(initiative.id);
        let newNode = new Initiative();
        newNode.children = []
        newNode.team_id = initiative.team_id;
        newNode.hasFocus = true;
        setTimeout(() => { newNode.hasFocus = false });
        treeNode.data.children = treeNode.data.children || [];
        treeNode.data.children.unshift(newNode);
        this.node.treeModel.setExpandedNode(treeNode, true);
        this.updateTreeEvent.emit(this.node.treeModel);
        this.edited.emit(true);
        this.add.emit(newNode);
    }


    removeChildNode(initiative: Initiative) {
        this.node.treeModel.getNodeById(initiative.id).data.children = [];
        let parent = this.node.treeModel.getNodeById(initiative.id).parent;
        let index = parent.data.children.indexOf(initiative);
        parent.data.children.splice(index, 1);
        this.updateTreeEvent.emit(this.node.treeModel);
        this.edited.emit(true)
    }

    openNode(node: Initiative) {
        this.open.emit(node);
    }

}

