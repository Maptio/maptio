import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { DatasetFactory } from './../../shared/services/dataset.factory';
import { DataSet } from './../../shared/model/dataset.data';
import { Initiative } from "./../../shared/model/initiative.data";
import { Observable } from "rxjs/Rx";
import { EmitterService } from "./../../shared/services/emitter.service";
import { Component, ViewChild } from "@angular/core";
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
    openedNode:Initiative;
    options = {
        allowDrag: true,
        allowDrop: true // (element:any, {parent:any, index:number}) => parent.isLeaf
    }

    SAVING_FREQUENCY: number = 60;

    @ViewChild(TreeComponent)
    tree: TreeComponent;

    @ViewChild("initiative")
    initiativeEditComponent: InitiativeComponent

    @ViewChild("initiativeModal")
    modal: ModalComponent;

    @ViewChild(InitiativeNodeComponent)
    node: InitiativeNodeComponent;

    constructor(private dataService: DataService, private datasetFactory: DatasetFactory) {
        this.nodes = [];

        Observable.timer(1000, this.SAVING_FREQUENCY * 1000)
            .switchMap(() => Observable
                .interval(1000)
                .map(i => {
                    if (i % this.SAVING_FREQUENCY === 0) {
                        this.saveChanges();
                    }
                    else {
                        EmitterService.get("timeToSaveInSec").emit(this.SAVING_FREQUENCY - i);
                    }
                    return i;
                }
                ))
            .subscribe(val => {

            });
    }

    saveChanges() {
        // console.log("building.component.ts", this.nodes[0])
        EmitterService.get("currentDataset").emit(this.nodes[0]);
    }

    isRootValid(): boolean {
        return (this.nodes[0].name !== undefined) && this.nodes[0].name.trim().length > 0;
    }

    mapData() {
        this.dataService.set(this.nodes[0]);
    }


    updateTreeModel() {
        this.tree.treeModel.update();
    }

    editInitiative(node: Initiative) {
        this.openedNode = node;
        let parent = node.getParent(this.nodes[0]);
        this.initiativeEditComponent.initiative = node;
        this.initiativeEditComponent.parent = parent;
        this.initiativeEditComponent.ngOnInit();
        this.modal.open();
        
        // this.initiativeEditComponent.open();
    }

    /**
     * Loads data into workspace
     * @param id Dataset Id
     * @param slugToOpen Slug of initiative to open
     */
    loadData(id: string, slugToOpen?: string) {
        // console.log(slugToOpen)
        // FIXME : this should return an initiative direcrtly
        this.datasetFactory.get(id).then(data => {

            this.nodes = [];
            this.nodes.push(new DataSet().deserialize(data).initiative);

            EmitterService.get("datasetName").emit(this.nodes[0].name);

            let defaultTeamId = this.nodes[0].team_id;
            let initiativeToOpen: Initiative = undefined;
            this.nodes[0].traverse(function (node: Initiative) {
                node.team_id = defaultTeamId; // For now, the sub initiative are all owned by the same team
                if (node.getSlug() === slugToOpen) {
                    initiativeToOpen = node;
                }
            });

            this.mapData();
            if (initiativeToOpen) {
                this.editInitiative(initiativeToOpen)
            }

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