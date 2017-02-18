import { Component, ViewChild } from "@angular/core";
import { Initiative } from "../../shared/model/initiative.data";
import { Person } from "../../shared/model/person.data"
import { InitiativeComponent } from "../initiative/initiative.component";
import { TreeComponent, TreeNode } from "angular2-tree-component";
import { DataService } from "../../shared/services/data.service";
import "rxjs/add/operator/map";
import { InitiativeNodeComponent } from "./initiative.node.component"

@Component({
    selector: "building",
    template: require("./building.component.html"),
    styles: [require("./building.component.css").toString()]
})

export class BuildingComponent {

    searched: string;
    nodes: Array<Initiative>;

    @ViewChild(TreeComponent)
    tree: TreeComponent;

    @ViewChild("initiative")
    initiativeEditComponent: InitiativeComponent

    @ViewChild(InitiativeNodeComponent)
    node: InitiativeNodeComponent;

    private dataService: DataService;

    constructor(dataService: DataService) {
        this.dataService = dataService;
        this.nodes = [];
    }

    // isEmpty(): boolean {
    //     return !this.nodes[0] || this.nodes[0].children.length === 0; // check if the root has any children
    // }

    isRootValid(): boolean {
        return (this.nodes[0].name != undefined) && this.nodes[0].name.trim().length > 0;
    }

    mapData() {
        this.dataService.setAsync(this.nodes[0]);
    }


    updateTreeModel() {
        this.tree.treeModel.update();
    }

    editInitiative(node: Initiative) {
        this.initiativeEditComponent.data = node;
        this.initiativeEditComponent.open();
    }


    loadData(url: string) {
        this.dataService.loadFromAsync(url).then(data => {
            this.nodes = [];
            this.nodes.push(new Initiative().deserialize(data));

            // FIXME : this should be another function/service
            let members = new Array<Person>();
            this.nodes[0].traverse(function (node: Initiative) {
                if (node.accountable && !members.find(function (person) {
                    return person.name === node.accountable.name
                })) {
                    members.push(node.accountable)
                }
            }
            );
            this.initiativeEditComponent.team = { members: members };

            this.mapData();
        });
    }

    filterNodes(searched: string) {
        this.nodes.forEach(function (i: Initiative) {
            i.traverse(function (node) { node.isSearchedFor = false });
        });

        this.tree.treeModel.filterNodes(
            (node: TreeNode) => {
                let initiative = (<Initiative>node.data);
                initiative.isSearchedFor = initiative.search(searched);
                return initiative.isSearchedFor;
            },
            true);
        this.mapData();

    }

}