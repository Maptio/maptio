import { EventEmitter } from "@angular/core";
// import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { DataSet } from "./../../shared/model/dataset.data";
import { Initiative } from "./../../shared/model/initiative.data";
import { Observable } from "rxjs/Rx";
import { EmitterService } from "./../../shared/services/emitter.service";
import { Component, ViewChild, Output } from "@angular/core";
import { InitiativeComponent } from "../initiative/initiative.component";
import { TreeComponent, TreeNode, IActionMapping, TreeModel, TREE_ACTIONS } from "angular2-tree-component";
import { DataService } from "../../shared/services/data.service";
import "rxjs/add/operator/map";
import { InitiativeNodeComponent } from "./initiative.node.component"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "building",
    template: require("./building.component.html"),
    styleUrls: ["./building.component.css"]
})
export class BuildingComponent {

    searched: string;
    nodes: Array<Initiative>;
    // openedNode: Initiative;
    // openedNodeParent: Initiative;

    fromInitiative: Initiative;
    toInitiative: Initiative;


    options = {
        allowDrag: true,
        allowDrop: true, // (element:any, {parent:any, index:number}) => parent.isLeaf,
        actionMapping: {
            mouse: {
                drop: (tree: TreeModel, node: TreeNode, $event: any, { from, to }: { from: any, to: any }) => {
                    // console.log(drop.from, drop.to)
                    this.fromInitiative = from.data;
                    this.toInitiative = to.parent.data;

                    this.modalService.open(this.dragConfirmationModal).result
                        .then(result => {
                            if (result) {
                                TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from: from, to: to })
                            }
                        })
                        .catch(reason => { });
                }
            }
        }
    }

    SAVING_FREQUENCY: number = 10;

    @ViewChild(TreeComponent)
    tree: TreeComponent;

    // @ViewChild("initiativeModal")
    // modal: ModalComponent;

    @ViewChild(InitiativeNodeComponent)
    node: InitiativeNodeComponent;

    @ViewChild("dragConfirmation")
    dragConfirmationModal: NgbModal;

    // @ViewChild("initiativeDetails")
    // initiativeDetailsModal: NgbModal;

    datasetId: string;

    @Output("save") save = new EventEmitter<Initiative>();
    @Output("openDetails") openDetails = new EventEmitter<Initiative>();

    constructor(private dataService: DataService, private datasetFactory: DatasetFactory, private modalService: NgbModal) {
        this.nodes = [];
    }

    saveChanges() {
        // console.log("building.component.ts", this.nodes[0])
        // EmitterService.get("currentInitiative").emit(this.nodes[0]);
        this.save.emit(this.nodes[0]);
        this.dataService.set({ initiative: this.nodes[0], datasetId: this.datasetId });
    }

    isRootValid(): boolean {
        return (this.nodes[0].name !== undefined) && this.nodes[0].name.trim().length > 0;
    }

    updateTreeModel() {
        this.tree.treeModel.update();
    }

    openNodeDetails(node: Initiative) {
        this.openDetails.emit(node)
    }

    // editInitiative(node: Initiative) {
    //     this.openedNodeParent = node.getParent(this.nodes[0]);
    //     this.openedNode = node;
    //     this.modalService.open(this.initiativeDetailsModal);
    //     // this.modal.open();
    // }

    /**
     * Loads data into workspace
     * @param id Dataset Id
     * @param slugToOpen Slug of initiative to open
     */
    loadData(id: string) {

        this.datasetFactory.get(id).then(data => {
            this.datasetId = id;
            this.nodes = [];
            this.nodes.push(new DataSet().deserialize(data).initiative);

            // EmitterService.get("datasetName").emit(this.nodes[0].name);

            let defaultTeamId = this.nodes[0].team_id;
            let initiativeToOpen: Initiative = undefined;
            this.nodes[0].traverse(function (node: Initiative) {
                node.team_id = defaultTeamId; // For now, the sub initiative are all owned by the same team
                // if (node.getSlug() === slugToOpen) {
                //     initiativeToOpen = node;
                // }
            });

            this.saveChanges();
            // if (initiativeToOpen) {
            //     this.editInitiative(initiativeToOpen)
            // }

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
        this.saveChanges();

    }

}