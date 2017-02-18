import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { TreeNode, TreeModel } from "angular2-tree-component";
import { Initiative } from "../../shared/model/initiative.data";
import { InitiativeComponent } from "../initiative/initiative.component";

@Component({
    selector: "initiative-node",
    template: require("./initiative.node.component.html")
})
export class InitiativeNodeComponent implements OnInit {

    @Input() node: TreeNode;

    @Output("map") updateDataEvent = new EventEmitter<Array<Initiative>>();
    @Output("update") updateTreeEvent = new EventEmitter<TreeModel>();
    @Output("openSelected") openSelectedEvent = new EventEmitter<Initiative>();


    @ViewChild("initiative")
    initiativeEditComponent: InitiativeComponent;


    ngOnInit() {
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
        this.updateDataEvent.emit(this.node.treeModel.nodes);
    }

    addChildNode(initiative: Initiative) {
        let treeNode = this.node.treeModel.getNodeById(initiative.id);
        let newNode = new Initiative();
        newNode.children = []
        newNode.hasFocus = true;
        setTimeout(() => { newNode.hasFocus = false });
        treeNode.data.children = treeNode.data.children || [];
        treeNode.data.children.push(newNode);
        this.node.treeModel.setExpandedNode(treeNode, true);
        this.updateTreeEvent.emit(this.node.treeModel);
    }


    removeChildNode(initiative: Initiative) {
        this.node.treeModel.getNodeById(initiative.id).data.children = [];
        let parent = this.node.treeModel.getNodeById(initiative.id).parent;
        let index = parent.data.children.indexOf(initiative);
        parent.data.children.splice(index, 1);
        this.updateTreeEvent.emit(this.node.treeModel);
    }


    openNode(node: Initiative) {
        this.openSelectedEvent.emit(node);
    }

    zoomInNode(node: Initiative) {
        (<Initiative>this.node.treeModel.nodes[0]).children.forEach(function (i: Initiative) {
            i.isZoomedOn = false;
            i.traverse(function (node: Initiative) { node.isZoomedOn = false });
        });
        (<Initiative>this.node.treeModel.nodes[0]).isZoomedOn = false;

        node.isZoomedOn = true;
        this.updateDataEvent.emit(this.node.treeModel.nodes);
    }

}

