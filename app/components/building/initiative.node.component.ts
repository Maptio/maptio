import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { TreeNode, TreeModel } from 'angular2-tree-component';
import { Initiative } from '../../model/initiative.data';
import { InitiativeComponent } from '../initiative/initiative.component';
//import { TreeExplorationService } from '../../services/tree.exploration.service';
import { FocusIfDirective } from '../../directives/focusif.directive';

@Component({
    selector: 'initiative-node',
    template: require('./initiative.node.component.html')
})
export class InitiativeNodeComponent implements OnInit {

    @Input() node: TreeNode;

    @Output('map') updateDataEvent = new EventEmitter<Array<Initiative>>();
    @Output('updateTree') updateTreeEvent = new EventEmitter<TreeModel>();
    @Output('openSelected') openSelectedEvent = new EventEmitter<Initiative>();


    @ViewChild('initiative')
    initiativeEditComponent: InitiativeComponent;


    ngOnInit() {
        // console.log(this.node);
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
        //let tree = this.node.treeModel;
        this.node.treeModel.getNodeById(initiative.id).toggleExpanded();
    }

    saveNodeName(newName: any, initiative: Initiative) {
        initiative.name = newName;
        //this.mapData();
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
        //this.updateTreeModel();
        this.updateTreeEvent.emit(this.node.treeModel);
    }


    removeChildNode(initiative: Initiative) {
        //remove all children
        this.node.treeModel.getNodeById(initiative.id).data.children = [];
        //remove node itself (from parent's children)
        let parent = this.node.treeModel.getNodeById(initiative.id).parent;
        let index = parent.data.children.indexOf(initiative);
        parent.data.children.splice(index, 1);
        //this.updateTreeModel();
        this.updateTreeEvent.emit(this.node.treeModel);
    }


    openNode(node: Initiative) {
        // this.initiativeEditComponent.data = node;
        // this.initiativeEditComponent.open();
        this.openSelectedEvent.emit(node);
    }

    zoomInNode(node: Initiative) {
       // console.log("ZOOM IN");
        //console.log(this.node.treeModel.nodes[0]);
        (<Initiative>this.node.treeModel.nodes[0]).children.forEach(function (i: Initiative) {
            //console.log(i.name);
            i.isZoomedOn = false;
            i.traverse(function (node: Initiative) { node.isZoomedOn = false });
        });
        (<Initiative>this.node.treeModel.nodes[0]).isZoomedOn = false;

        node.isZoomedOn = true;
        //this.mapData();
        this.updateDataEvent.emit(this.node.treeModel.nodes);
    }

}

