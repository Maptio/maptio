import { ActivatedRouteSnapshot, ActivatedRoute } from "@angular/router";
import { Component, Input, Output, ViewChild, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
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
    // nodesList: Array<any>

    @Output("edited") edited = new EventEmitter<boolean>();
    @Output("update") updateTreeEvent = new EventEmitter<TreeModel>();
    @Output("open") open = new EventEmitter<Initiative>();
    @Output("add") add = new EventEmitter<Initiative>();

    @ViewChild("initiative")
    editInitiative: InitiativeComponent;

    private snapshotRoute: ActivatedRouteSnapshot
    isMovingToggled: boolean;

    constructor(private route: ActivatedRoute, private cd : ChangeDetectorRef
    ) {
        this.snapshotRoute = route.snapshot;
    }

    // ngOnInit() {
    //     this.nodesList = this.getNodesList();
    // }


    isRoot(): boolean {
        return this.node.isRoot;
    }

    isFirstLevel() {
        return this.node.parent.isRoot;
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
        this.cd.detectChanges();
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

    // moveUp(node: TreeNode) {
    //     let parent = node.parent;
    //     let previous = node.findPreviousSibling();
    //     node.treeModel.moveNode(node, { parent: parent, index: previous.index });
    //     this.updateTreeEvent.emit(this.node.treeModel);
    // }

    // moveDown(node: TreeNode) {
    //     let parent = node.parent;
    //     let next = node.findNextSibling();
    //     node.treeModel.moveNode(node, { parent: parent, index: next.index + 1 });
    //     this.updateTreeEvent.emit(this.node.treeModel);
    // }

    // moveLeft(node: TreeNode) {
    //     let parent = node.parent.parent;
    //     // let previous = node.findPreviousSibling();
    //     node.treeModel.moveNode(node, { parent: parent });
    //     this.updateTreeEvent.emit(this.node.treeModel);
    // }

    // changeParent(parentId: string) {
    //     let parent = this.node.treeModel.getNodeById(parentId);
    //     this.node.treeModel.moveNode(this.node, { parent: parent });
    //     this.updateTreeEvent.emit(this.node.treeModel);
    // }

    // getNodesList() {
    //     let list: any[] = [];
    //     this.node.treeModel.doForAll((node: TreeNode) => {
    //         list.push({ id: node.id, name: `${Array(node.level).join("\xA0\xA0\xA0")}${node.data.name}` })
    //     })
    //     return list;
    // }

}

