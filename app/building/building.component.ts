import {Component, OnInit, ViewChild} from '@angular/core';
import {InitiativeData} from './initiative.component'
import {TreeComponent} from 'angular2-tree-component';
import {DataService} from '../services/data.service';
import 'rxjs/add/operator/map'

export class CustomTreeNode{
    
    
    id:number;
    name:string;
    person:string;
    isRoot:boolean=false;
    description:string= undefined;
    private _size:number = undefined ; //(this.children === undefined ? 0 : this.children.length);
    children:Array<CustomTreeNode>;

    get size():number {
        return this._size || 1;
    }

    set size(size:number){
        this._size = size;
    }

    // constructor(name:string, description:string,children:Array<CustomTreeNode>){
    //     this.name = name;
    //     this.children = children;
    //     this.description = description;
    // }


}


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
                        <a class="btn" (click)="addChildNode(node.data)"><i class="fa fa-plus" aria-hidden="true"></i></a>
                        <a class="btn" *ngIf="!node.isRoot" (click)="removeChildNode(node.data)"><i class="fa fa-minus" aria-hidden="true"></i></a>
                        <a class="btn" *ngIf="!node.isRoot && !node.isExpanded" (click)="toggleNode(node)"><i class="fa fa-caret-square-o-down" aria-hidden="true"></i></a>
                        <a class="btn" *ngIf="!node.isRoot && node.isExpanded" (click)="toggleNode(node)"><i class="fa fa-caret-square-o-right" aria-hidden="true"></i></a>
                    </div>

                    <div (focus)="saveData($event)">
                        <input *ngIf="!node.isRoot" [ngModel]="node.data.name" placeholder="Initiative name" (ngModelChange)="saveNodeName($event, node.data)">
                        <input *ngIf="!node.isRoot" [ngModel]="node.data.description" placeholder="Description" (ngModelChange)="saveNodeDescription($event, node.data)">
                        <input *ngIf="!node.isRoot" [ngModel]="node.data.size" placeholder="Team Size"  (ngModelChange)="saveNodeSize($event, node.data)">
                    </div>
                </template>
            </Tree>
        </div>
    `,
    styles:[require('./building.component.css').toString()]
})

export class BuildingComponent implements OnInit {

    private root:CustomTreeNode;
    private nodes:Array<CustomTreeNode>;

    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    private dataService:DataService;

    constructor(dataService:DataService){
        this.dataService = dataService;
    }


    saveNodeName(newName:any, node:CustomTreeNode){
        node.name = newName;
        this.saveData();
    }

    saveNodeDescription(newDesc:string, node:CustomTreeNode){
        node.description = newDesc;
        this.saveData();
    }

    saveNodeSize(newSize:number, node:CustomTreeNode){
        node.size = newSize;
        this.saveData();
    }

    saveData(){
        this.dataService.setData(this.root);
    }

    updateTreeModel():void{

        this.tree.treeModel.update();
    }

    addChildNode(node:CustomTreeNode){
        let treeNode = this.tree.treeModel.getNodeById(node.id);
        let newNode = new CustomTreeNode();
        newNode.children = []
        treeNode.data.children.push(newNode);
        this.tree.treeModel.setExpandedNode(treeNode,true);
        this.updateTreeModel();
    }   


    removeChildNode(node:CustomTreeNode){
        //remove all children
        this.tree.treeModel.getNodeById(node.id).data.children =[];
        //remove node itself (from parent's children)
        let parent = this.tree.treeModel.getNodeById(node.id).parent;
        let index = parent.data.children.indexOf(node);
        parent.data.children.splice(index, 1);
        this.updateTreeModel();
    }

    toggleNode(node:CustomTreeNode){
         this.tree.treeModel
            .getNodeById(node.id).toggleExpanded();
    }

    initializeTree(){
         this.root = new CustomTreeNode();
        this.root.children = [];
        this.root.isRoot = true;
        //this.root.size = 1;
        this.nodes = [];
        this.nodes.push(this.root);
        this.saveData();
    }


    ngOnInit(): void {
    
       
    }



}