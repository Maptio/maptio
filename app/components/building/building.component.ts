import { Component, OnInit, ViewChild, ViewChildren, Directive, Input, ElementRef, Inject, QueryList, Query } from '@angular/core';
//import { InitiativeComponent} from './initiative.component'
import { InitiativeNode } from '../../model/initiative.data';
import { Team } from '../../model/team.data'
import { Person } from '../../model/person.data'
import { InitiativeComponent } from '../initiative/initiative.component';
import { TreeComponent, TreeNode } from 'angular2-tree-component';
import { DataService } from '../../services/data.service';
import { TreeExplorationService } from '../../services/tree.exploration.service'
import { FocusIfDirective } from '../../directives/focusif.directive'
import { AutoSelectDirective } from '../../directives/autoselect.directive'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map'


@Component({
    selector: 'building',
    template: require('./building.component.html'),
    styles: [require('./building.component.css').toString()]
})

export class BuildingComponent {

    searched:string;
    nodes: Array<InitiativeNode>;

    @ViewChild(TreeComponent)
    tree: TreeComponent;

    @ViewChild('initiative')
    initiativeEditComponent: InitiativeComponent;

    private dataService: DataService;
    private treeExplorationService: TreeExplorationService;

    constructor(dataService: DataService, treeExplorationService: TreeExplorationService) {
        this.dataService = dataService;
        this.treeExplorationService = treeExplorationService;
        this.nodes = [];
    }

    // isEmpty(): boolean {
    //     return !this.nodes[0] || this.nodes[0].children.length === 0; // check if the root has any children
    // }

    isRootValid(): boolean {
        return (this.nodes[0].name != undefined) && this.nodes[0].name.trim().length > 0;
    }

    saveNodeName(newName: any, node: InitiativeNode) {
        node.name = newName;
        this.mapData();
    }

    mapData() {
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
        treeNode.data.children = treeNode.data.children || [];
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
        this.initiativeEditComponent.data = node;
        this.initiativeEditComponent.open();
    }

    zoomInNode(node: InitiativeNode) {

        TreeExplorationService.traverseAll<InitiativeNode>(this.nodes, function (node) { node.isZoomedOn = false });
        //InitiativeNode.resetZoomedOn(this.nodes);

        node.isZoomedOn = true;
        this.mapData();
    }

    loadData(url: string) {
        this.dataService.loadFromAsync(url).then(data => {
            this.nodes = [];
            let parsedNodes: InitiativeNode = Object.assign(new InitiativeNode(), data)
            this.nodes.push(parsedNodes);

            // REFACTOR : this should be another function/service
            let members = new Array<Person>();
            TreeExplorationService.traverseOne<InitiativeNode>(parsedNodes, function (node) {
                if (node.accountable && !members.find(function (person) { return person.name === node.accountable.name }))
                    members.push(node.accountable)
            }
            );
            this.initiativeEditComponent.team = { members: members };

            this.mapData();
        });
    }

    filterNodes(searched: string) {
        TreeExplorationService.traverseAll<InitiativeNode>(this.nodes, function (node) { node.isSearchedFor = false });
        this.tree.treeModel.filterNodes(
            (node: TreeNode) => {
                let initiative = (<InitiativeNode>node.data);
                initiative.isSearchedFor = initiative.search(searched);
                return initiative.isSearchedFor;
            },
            true);
        this.mapData();

    }

}