import {Component, OnInit, ViewChild} from '@angular/core';
import {InitiativeData} from './initiative.component'
import {TreeComponent} from 'angular2-tree-component';

export class CustomTreeNode{
    
    
    id:number;
    name:string;
    //hasChildren:boolean;
    //isExpanded:boolean;
    //isHidden:boolean;
    //data:InitiativeData;
    //parent: CustomTreeNode;
    children:Array<CustomTreeNode>;

    constructor(name:string, children:Array<CustomTreeNode>){
        this.name = name;
        this.children = children;
    }

}


@Component({
    selector:'building',
    //templateUrl:'./building.component.html',
    template:
    ` 
        <button (click)="addChildNode(root)">Add first level</button>
        <Tree [nodes]="nodes">
            <template #treeNodeTemplate let-node>
                <span>{{node.data.name}}</span>
                <button (click)="addChildNode(node.data)">Add child</button>
            </template>
        </Tree>
    `,
    styles:[require('./building.component.css').toString()]
})

export class BuildingComponent implements OnInit {

    private root:CustomTreeNode;
    private nodes:Array<CustomTreeNode>;

    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    constructor(){
    
    }

    updateTreeModel():void{
        // this.tree.treeModel.nodes = this.nodes;
        // console.log("CURRENT NODES");
        // console.log(this.nodes);
        this.tree.treeModel.update()
    }

    addChildNode(node:CustomTreeNode){
        console.log("SELECTED NODE");
        console.log(node);
        console.log("ALL NODES");
        console.log(this.nodes);
        
        let foundNode = this.tree.treeModel.getNodeById(node.id).data;
        console.log("FOUND");
        console.log(foundNode);
        

        // let foundNode = this.nodes.find(n => n.name === node.name);
        //     console.log("FOUND" + foundNode);
        foundNode.children.push(new CustomTreeNode(
            "Node " + (node.children.length+1).toString(),
            []
            ));
        
        this.updateTreeModel();
    }   


    ngOnInit(): void {
    
        this.root = new CustomTreeNode("ROOT", []);
        this.nodes = [];
        this.nodes.push(this.root);
    }

    // add(node:InitiativeData){
    //     var post = node.children.length + 1;
    //     var newName = node.name + '-' + post;
    //     node.children.push({name:newName, expanded:true, children:[]});
    // }

    // delete(node: InitiativeData) :void{
    //     node.children = [];
    // }

    // collapse(node:InitiativeData){
    //     node.expanded = false;
    // }

    // expand(node:InitiativeData){
    //     node.expanded = true;
    // }

}