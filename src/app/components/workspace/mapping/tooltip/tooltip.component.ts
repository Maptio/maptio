import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input, ViewChild } from "@angular/core";
import { Initiative } from "../../../../shared/model/initiative.data";

@Component({
    selector: "tooltip",
    templateUrl: "./tooltip.component.html",
    styleUrls: ["./tooltip.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TooltipComponent {

    @Input("initiative") initiative: Initiative;

    constructor() {
    }
}