import { OnChanges } from '@angular/core';
import { EmitterService } from './../../shared/services/emitter.service';
import { DatasetFactory } from './../../shared/services/dataset.factory';
import { DataSet } from './../../shared/model/dataset.data';
import { ViewChild } from '@angular/core';
import { BuildingComponent } from './../building/building.component';
import { Component, OnInit, SimpleChanges, DoCheck, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";

@Component({
    selector: 'workspace',
    template: require("./workspace.component.html")
})


export class WorkspaceComponent implements OnInit, OnDestroy {

    @ViewChild("building")
    buildingComponent: BuildingComponent

    public isBuildingPanelCollapsed: boolean = true;
    private datasetId: string;
    private subscription: any;

    constructor(private route: ActivatedRoute, private datasetFactory: DatasetFactory) {
        this.subscription = EmitterService.get("currentDataset").subscribe((value: any) => {
            this.datasetFactory.upsert(value, this.datasetId)
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        console.log("workspace.components.ts ngOnInit");
        this.route.params.subscribe((params: Params) => {
            this.datasetId = params["id"];
            this.buildingComponent.loadData(this.datasetId);
        });
    }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }

}