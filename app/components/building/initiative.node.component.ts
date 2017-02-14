import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { TreeNode, TreeModel } from 'angular2-tree-component';
import { InitiativeNode } from '../../model/initiative.data';
import { InitiativeComponent } from '../initiative/initiative.component';
import { TreeExplorationService } from '../../services/tree.exploration.service';
import { FocusIfDirective } from '../../directives/focusif.directive';

@Component({
    selector: 'initiative-node',
    template: require('./initiative.node.component.html')
})
export class InitiativeNodeComponent implements OnInit {

    @Input() node: TreeNode;

    @Output('map') updateDataEvent = new EventEmitter<Array<InitiativeNode>>();
    @Output('updateTree') updateTreeEvent = new EventEmitter<TreeModel>();
    @Output('openSelected') openSelectedEvent = new EventEmitter<InitiativeNode>();


    @ViewChild('initiative')
    initiativeEditComponent: InitiativeComponent;


    ngOnInit() {
        // console.log(this.node);
    }

    isRoot():boolean{
        return this.node.isRoot;
    }

    hasChildren():boolean{
       return this.node.hasChildren;
    }

    isExpanded():boolean{
        return this.node.isExpanded;
    }

    toggleNode(initiative: InitiativeNode) {
        //let tree = this.node.treeModel;
        this.node.treeModel.getNodeById(initiative.id).toggleExpanded();
    }

    saveNodeName(newName: any, initiative: InitiativeNode) {
        initiative.name = newName;
        //this.mapData();
        this.updateDataEvent.emit(this.node.treeModel.nodes);
    }

    addChildNode(initiative: InitiativeNode) {
        let treeNode = this.node.treeModel.getNodeById(initiative.id);
        let newNode = new InitiativeNode();
        newNode.children = []
        newNode.hasFocus = true;
        setTimeout(() => { newNode.hasFocus = false });
        treeNode.data.children = treeNode.data.children || [];
        treeNode.data.children.push(newNode);
        this.node.treeModel.setExpandedNode(treeNode, true);
        //this.updateTreeModel();
        this.updateTreeEvent.emit(this.node.treeModel);
    }


    removeChildNode(initiative: InitiativeNode) {
        //remove all children
        this.node.treeModel.getNodeById(initiative.id).data.children = [];
        //remove node itself (from parent's children)
        let parent = this.node.treeModel.getNodeById(initiative.id).parent;
        let index = parent.data.children.indexOf(initiative);
        parent.data.children.splice(index, 1);
        //this.updateTreeModel();
        this.updateTreeEvent.emit(this.node.treeModel);
    }


    openNode(node: InitiativeNode) {
        // this.initiativeEditComponent.data = node;
        // this.initiativeEditComponent.open();
        this.openSelectedEvent.emit(node);
    }

    zoomInNode(node: InitiativeNode) {

        TreeExplorationService.traverseAll<InitiativeNode>((<InitiativeNode>this.node.data).children, function (node: InitiativeNode) { node.isZoomedOn = false });
        //InitiativeNode.resetZoomedOn(this.nodes);

        node.isZoomedOn = true;
        //this.mapData();
        this.updateDataEvent.emit(this.node.treeModel.nodes);
    }

}

