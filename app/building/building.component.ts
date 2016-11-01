import {Component, OnInit, ViewChild, Directive, Input, ElementRef, Inject} from '@angular/core';
import {InitiativeNode} from './initiative.component'
import {TreeComponent} from 'angular2-tree-component';
import {DataService} from '../services/data.service';
import {FocusDirective} from '../directives/focus.directive'
import 'rxjs/add/operator/map'




@Component({
    selector:'building',
    //templateUrl:'./building.component.html',
    template:
    `
        <div>
           <a class="btn btn-lg btn-success" (click)="initializeTree()">Start mapping your project</a>
        </div>

        <div>
            <Tree [nodes]="nodes" (onUpdateData)="saveData($event)">
                <template #treeNodeTemplate let-node>
                    <div class="btn-group">
                        <a class="btn addNode" (click)="addChildNode(node.data)"><i class="fa fa-plus" aria-hidden="true"></i></a>
                        <a class="btn removeNode" *ngIf="!node.isRoot" (click)="removeChildNode(node.data)"><i class="fa fa-minus" aria-hidden="true"></i></a>
                        <a class="btn expandNode" *ngIf="!node.isRoot && !node.isExpanded" (click)="toggleNode(node)"><i class="fa fa-caret-square-o-down" aria-hidden="true"></i></a>
                        <a class="btn hideNode" *ngIf="!node.isRoot && node.isExpanded" (click)="toggleNode(node)"><i class="fa fa-caret-square-o-right" aria-hidden="true"></i></a>
                    </div>

                    <div class="initiative">
                        <input class="name" *ngIf="!node.isRoot" [focus]="node.data.hasFocus" [ngModel]="node.data.name" placeholder="Initiative name" (ngModelChange)="saveNodeName($event, node.data)">
                        <input class="size" *ngIf="!node.isRoot" [ngModel]="node.data.size" placeholder="Team Size"  (ngModelChange)="saveNodeSize($event, node.data)">
                        <textarea class="description" rows="3" *ngIf="!node.isRoot" [ngModel]="node.data.description" placeholder="Description" (ngModelChange)="saveNodeDescription($event, node.data)"></textarea>
                    </div>
                </template>
            </Tree>
        </div>
    `,
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
    
        this.dataService.setData(this.root);
    }

    updateTreeModel():void{

        this.tree.treeModel.update();
    }

    addChildNode(node:InitiativeNode){
        let treeNode = this.tree.treeModel.getNodeById(node.id);
        let newNode = new InitiativeNode();
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
         this.root = new InitiativeNode();
        this.root.children = [];
        this.root.isRoot = true;
        this.root.name = "ROOT";
        //this.root.size = 1;
        this.nodes = [];
        this.nodes.push(this.root);
        this.saveData();
    }


    ngOnInit(): void {
    this.initializeTree();
       
    }



}