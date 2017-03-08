import { ViewChild } from '@angular/core';
import { BuildingComponent } from './../building/building.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";

@Component({
    selector: 'workspace',
    template: require("./workspace.component.html")
})
export class WorkspaceComponent implements OnInit {

    @ViewChild("building")
    buildingComponent: BuildingComponent

    public isBuildingPanelCollapsed: boolean = true;

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            let id = params["id"];
            this.buildingComponent.loadData(id)
        });
    }

    toggleBuildingPanel() {
        this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
    }
}