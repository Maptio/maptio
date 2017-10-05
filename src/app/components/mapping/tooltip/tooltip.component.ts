import { UIService } from "./../../../shared/services/ui/ui.service";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input, ViewChild } from "@angular/core";
import { Subscription } from "rxjs/Rx";
import { InitiativeComponent } from "../../initiative/initiative.component";

@Component({
    selector: "tooltip",
    templateUrl: "./tooltip.component.html",
    styleUrls: ["./tooltip.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TooltipComponent implements OnInit, OnDestroy {

    public datasetId: string;
    public teamId: string;
    public node: Initiative;
    public parent: Initiative;
    public isReadOnly: boolean;
    public isHidden: boolean = true;
    public left: number;
    public top: number;

    public subscription: Subscription;

    constructor(private uiService: UIService, private cd: ChangeDetectorRef) {

        this.update()
    }


    ngOnInit() {

    }

    update() {
        this.subscription = this.uiService.getTooltipData().subscribe(
            (settings: [string, Initiative, Initiative]) => {
                this.datasetId = settings[0];
                this.node = settings[1];
                this.parent = settings[2]
                this.isReadOnly = true;
                this.isHidden = false;
                this.cd.markForCheck();

            },
            (error: any) => console.log(error));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}