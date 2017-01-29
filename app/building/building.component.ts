import { Component, OnInit, ViewChild, ViewChildren, Directive, Input, ElementRef, Inject, QueryList, Query } from '@angular/core';
//import { InitiativeComponent} from './initiative.component'
import { InitiativeNode } from '../model/initiative.data';
import { Team } from '../model/team.data'
import { Person } from '../model/person.data'
import { InitiativeComponent } from '../initiative/initiative.component';
import { TreeComponent } from 'angular2-tree-component';
import { DataService } from '../services/data.service';
import { TreeExplorationService } from '../services/tree.exploration.service'
import { FocusIfDirective } from '../directives/focusif.directive'
import { AutoSelectDirective } from '../directives/autoselect.directive'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map'


@Component({
    selector: 'building',
    templateUrl: 'building.component.html',
    styles: [require('./building.component.css').toString()]
})

export class BuildingComponent {

    private nodes: Array<InitiativeNode>;
    private selectedNode: InitiativeNode;
    private selectedTeam: Team;

    @ViewChild(TreeComponent)
    private tree: TreeComponent;

    @ViewChild('initiative')
    private initiativeEditComponent: InitiativeComponent;

    private dataService: DataService;
    private treeExplorationService: TreeExplorationService;

    constructor(dataService: DataService, treeExplorationService:TreeExplorationService) {
        this.dataService = dataService;
        this.treeExplorationService = treeExplorationService;
        this.nodes = [];
    }

    isEmpty(): boolean {
        return !this.nodes[0] || this.nodes[0].children.length === 0; // check if the root has any children
    }

    isRootValid(): boolean {
        return this.nodes[0].name.length > 0;
    }

    saveNodeName(newName: any, node: InitiativeNode) {
        node.name = newName;
        this.saveData();
    }

    saveData() {
        // console.log("SAVE HERE");
        // console.log(JSON.stringify(this.nodes));
        this.dataService.setAsync(this.nodes[0]);
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
        this.initiativeEditComponent.open();
    }

    goToNode(node: InitiativeNode) {

        TreeExplorationService.reset<InitiativeNode>(this.nodes, function(node){node.isZoomedOn = false});
        //InitiativeNode.resetZoomedOn(this.nodes);

        node.isZoomedOn = true;
        this.saveData();
    }

    loadData(url: string) {
        this.dataService.loadFromAsync(url).then(data => {
            this.nodes = [];
            let parsedNodes: InitiativeNode = Object.assign(new InitiativeNode(), data)
            this.nodes.push(parsedNodes);

            // another function/service
            let members = new Array<Person>();
            TreeExplorationService.traverse<InitiativeNode>(parsedNodes, function (node) {
                if (node.accountable && !members.find(function (person) { return person.name === node.accountable.name }))
                    members.push(node.accountable)
            }
            );

            this.selectedTeam = { members: members };
            this.saveData();
        });
    }

    filterNodes(searched: string) {

        TreeExplorationService.reset<InitiativeNode>(this.nodes, function(node){node.isSearchedFor = false});
        
        //InitiativeNode.resetSearchedFor(this.nodes);
        this.tree.treeModel.filterNodes(
            (node: any) => {
                if (searched === "") {
                    return true;
                }
                else {
                    if (
                        (<InitiativeNode>node.data).name && (<InitiativeNode>node.data).name.toLowerCase().includes(searched.toLowerCase())
                        ||
                        (<InitiativeNode>node.data).description && (<InitiativeNode>node.data).description.toLowerCase().includes(searched.toLowerCase())
                    ) {
                        (<InitiativeNode>node.data).isSearchedFor = true;
                        return true;
                    }
                    return false;
                }
            },
            true);
        this.saveData();

    }

}