import { Component, OnInit, ViewChild, ViewChildren, Directive, Input, ElementRef, Inject, QueryList, Query } from '@angular/core';
//import { InitiativeComponent} from './initiative.component'
import { InitiativeNode } from '../model/initiative.data';
import { TreeComponent } from 'angular2-tree-component';
import { DataService } from '../services/data.service';
import { FocusDirective } from '../directives/focus.directive'
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map'


@Component({
    selector: 'building',
    templateUrl: 'building.component.html',
    styles: [require('./building.component.css').toString()]
})

export class BuildingComponent {

    private nodes: Array<InitiativeNode>;
    private selectedNode: InitiativeNode;

    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    @ViewChild('initiativeModal')
    modal: ModalComponent;

    private dataService: DataService;

    constructor(dataService: DataService) {
        this.dataService = dataService;
        this.nodes = [];
    }

    isEmpty():boolean{
        return !this.nodes || this.nodes.length === 0 ;
    }

    saveNodeName(newName: any, node: InitiativeNode) {
        node.name = newName;
        this.saveData();
    }

    saveData() {
        // console.log("SAVE HERE");
        // console.log(JSON.stringify(this.nodes));
        this.dataService.setData(this.nodes[0]);
    }

    updateTreeModel(): void {
        // console.log("UPdate");
        // console.log(JSON.stringify(this.nodes));
        this.tree.treeModel.update();
    }

    addChildNode(node: InitiativeNode) {
        let treeNode = this.tree.treeModel.getNodeById(node.id);
        let newNode = new InitiativeNode();
        newNode.children = []
        newNode.hasFocus = true;
        setTimeout(() => { newNode.hasFocus = false });
        treeNode.data.children.push(newNode);
        this.tree.treeModel.setExpandedNode(treeNode, true);
        this.updateTreeModel();
    }


    removeChildNode(node: InitiativeNode) {
        //remove all children
        this.tree.treeModel.getNodeById(node.id).data.children = [];
        //remove node itself (from parent's children)
        let parent = this.tree.treeModel.getNodeById(node.id).parent;
        let index = parent.data.children.indexOf(node);
        parent.data.children.splice(index, 1);
        this.updateTreeModel();
    }

    toggleNode(node: InitiativeNode) {
        this.tree.treeModel
            .getNodeById(node.id).toggleExpanded();
    }

    openNode(node: InitiativeNode) {
        this.selectedNode = node;
        this.modal.open();
    }

    goToNode(node:InitiativeNode){
        console.log(this.nodes);
        
        this.nodes.forEach(function(n:InitiativeNode){
            n.isZoomedOn = false;
            InitiativeNode.traverse(n, function(node){node.isZoomedOn = false});
        })
        node.isZoomedOn = true;
        this.saveData();
    }

    loadData(filename:string) {
        let url = '../../../assets/datasets/' + filename;
        this.dataService.getRawData(url).then(data => {
            this.nodes = [];
            let parsed: InitiativeNode = Object.assign(new InitiativeNode(), data)
            this.nodes.push(parsed);
            this.saveData();
        })
    }

}