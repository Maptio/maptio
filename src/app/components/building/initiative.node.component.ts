import { Router, ActivatedRouteSnapshot, ActivatedRoute } from "@angular/router";
import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { TreeNode, TreeModel } from "angular-tree-component";
import { Initiative } from "../../shared/model/initiative.data";
import { InitiativeComponent } from "../initiative/initiative.component";

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

    @Output("edited") edited = new EventEmitter<boolean>();

    // @Output("map") updateDataEvent = new EventEmitter<Array<Initiative>>();
    @Output("update") updateTreeEvent = new EventEmitter<TreeModel>();
    // @Output("openSelected") openSelectedEvent = new EventEmitter<Initiative>();

    @Output("open") open = new EventEmitter<Initiative>();

    @Output("add") add = new EventEmitter<Initiative>();



    @ViewChild("initiative")
    editInitiative: InitiativeComponent;

    private snapshotRoute: ActivatedRouteSnapshot

    constructor(private router: Router, private route: ActivatedRoute) {
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
        // console.log(newName)
        initiative.name = newName;
        // this.updateDataEvent.emit(this.node.treeModel.nodes);
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

    // zoomInNode(node: Initiative) {
    //     (<Initiative>this.node.treeModel.nodes[0]).children.forEach(function (i: Initiative) {
    //         i.isZoomedOn = false;
    //         i.traverse(function (node: Initiative) { node.isZoomedOn = false });
    //     });
    //     (<Initiative>this.node.treeModel.nodes[0]).isZoomedOn = false;

    //     node.isZoomedOn = true;
    //     // this.updateDataEvent.emit(this.node.treeModel.nodes);
    //     this.edited.emit(true)
    // }

}

