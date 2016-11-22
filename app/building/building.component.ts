import { Component, OnInit, ViewChild, ViewChildren, Directive, Input, ElementRef, Inject , QueryList, Query} from '@angular/core';
//import { InitiativeComponent} from './initiative.component'
import {InitiativeNode} from './initiative.data';
import { TreeComponent } from 'angular2-tree-component';
import { DataService } from '../services/data.service';
import { FocusDirective } from '../directives/focus.directive'
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import 'rxjs/add/operator/map'


@Component({
    selector: 'building',
    templateUrl: 'building.component.html',
    styles: [require('./building.component.css').toString()]
})

export class BuildingComponent implements OnInit {

    //private root:InitiativeNode;
    private nodes: Array<InitiativeNode>;
    private selectedNode:InitiativeNode;

    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    @ViewChild('initiativeModal')
    modal: ModalComponent;

    private dataService: DataService;

    constructor(dataService: DataService) {
        this.dataService = dataService;
        this.nodes = [];
    }


    saveNodeName(newName: any, node: InitiativeNode) {
        node.name = newName;
        this.saveData();
    }

    saveNodeDescription(newDesc: string, node: InitiativeNode) {
        node.description = newDesc;
        this.saveData();
    }

    saveNodeSize(newSize: number, node: InitiativeNode) {
        node.size = newSize;
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

    initializeTree() {

        let url = '../../../assets/datasets/new.json';
        this.dataService.getRawData(url).then(data => {
            this.nodes = [];
            let parsed : InitiativeNode = Object.assign( new InitiativeNode(), data )
            this.nodes.push(parsed);
            this.saveData();
        })
    }

    seeNode(node: InitiativeNode) {
        this.selectedNode = node;
        console.log(node.id);
        console.log(this.modal);
        this.modal.open();
        // this.modals.forEach(function(elem, index){
        //     console.log(index)
        //     if(index === node.id){
        //         elem.open();
        //     }
        // })
    }


    loadData() {
        let url = '../../../assets/datasets/vestd.json';
        this.dataService.getRawData(url).then(data => {
            this.nodes = [];
            //this.nodes.push(new InitiativeNode(data));
            let parsed : InitiativeNode = Object.assign( new InitiativeNode(), data )
            this.nodes.push(parsed);
            this.saveData();
        })


    }


    ngOnInit(): void {
        // this.initializeTree();
        // this.loadData();
    }



}