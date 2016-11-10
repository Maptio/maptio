import {Component, OnInit, ViewChild, Directive, Input, ElementRef, Inject} from '@angular/core';
import {InitiativeNode} from './initiative.component'
import {TreeComponent} from 'angular2-tree-component';
import {DataService} from '../services/data.service';
import {FocusDirective} from '../directives/focus.directive'
import 'rxjs/add/operator/map'


@Component({
    selector:'building',
   templateUrl:'building.component.html',
    styles:[require('./building.component.css').toString()]
})

export class BuildingComponent implements OnInit {

    private root:InitiativeNode;
    private nodes:Array<InitiativeNode>;

    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    private dataService:DataService;

    constructor(dataService:DataService){
        this.dataService = dataService;
        // this.dataService
        //     .getData()
        //     .subscribe(
        //         data => {
        //             this.nodes.splice(0, this.nodes.length);
        //             this.nodes.push(new InitiativeNode(data));
        //             this.updateTreeModel();
        //             },
        //         err => {console.log(err)},
        //         () => {}
        //     );
    }


    saveNodeName(newName:any, node:InitiativeNode){
        node.name = newName;
        this.saveData();
    }

    saveNodeDescription(newDesc:string, node:InitiativeNode){
        node.description = newDesc;
        this.saveData();
    }

    saveNodeSize(newSize:number, node:InitiativeNode){
        node.size = newSize;
        this.saveData();
    }

    saveData(){
        console.log("SAVE HERE");
        console.log(JSON.stringify(this.nodes));
        this.dataService.setData(this.nodes[0]);
    }

    updateTreeModel():void{
        console.log("UPdate");
        console.log(JSON.stringify(this.nodes));
        this.tree.treeModel.update();
    }

    addChildNode(node:InitiativeNode){
        let treeNode = this.tree.treeModel.getNodeById(node.id);
        let newNode = new InitiativeNode(null);
        newNode.children = []
        newNode.hasFocus = true;
        setTimeout(() => {newNode.hasFocus = false});
        treeNode.data.children.push(newNode);
        this.tree.treeModel.setExpandedNode(treeNode,true);
        this.updateTreeModel();
    }   


    removeChildNode(node:InitiativeNode){
        //remove all children
        this.tree.treeModel.getNodeById(node.id).data.children =[];
        //remove node itself (from parent's children)
        let parent = this.tree.treeModel.getNodeById(node.id).parent;
        let index = parent.data.children.indexOf(node);
        parent.data.children.splice(index, 1);
        this.updateTreeModel();
    }

    toggleNode(node:InitiativeNode){
         this.tree.treeModel
            .getNodeById(node.id).toggleExpanded();
    }

    initializeTree(){
        this.root = new InitiativeNode(null);
        this.root.children = [];
        this.root.isRoot = true;
        this.root.name = "ROOT";
        this.nodes = [];
        this.nodes.push(this.root);
        this.saveData();
    }



    loadData(){
       //this.dataService.loadData('../../../assets/datasets/vestd.json');
       let url = '../../../assets/datasets/vestd.json';
       this.dataService.getRawData(url).then(data =>{
            this.nodes = [];
            this.nodes.push(new InitiativeNode(data));
            console.log("LOADED");
            console.log(data)
            console.log(JSON.stringify(this.nodes))
            this.saveData();
       })
       
       
    }


    ngOnInit(): void {
        this.initializeTree();
    }



}