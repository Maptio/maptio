import {Component, OnInit} from '@angular/core';

@Component({
    selector:'initiative',
    template:`
    <!--<button ng-click="collapse(node)" ng-show="(node.children.length > 0)&&(node.expanded)">Collapse</button>
    <button ng-click="expand(node)" ng-show="(node.children.length > 0)&&(!node.expanded)">Expand</button>
    {{node.name}}
    <button ng-click="add(node)">Add node</button>
    <button ng-click="delete(node)" ng-show="node.children.length > 0">Delete nodes</button>-->
    Name : {{name}}
    `
})

export class InitiativeData{
    id:number;
    name:string;
    hasChildren:boolean;
    isExpanded:boolean;
    isHidden:boolean;
    //size:number;
    //description:string;
    // expanded:boolean;
    children:Array<InitiativeData>;
}
