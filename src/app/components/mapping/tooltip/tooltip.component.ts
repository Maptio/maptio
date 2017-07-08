import { UIService } from "./../../../shared/services/ui/ui.service";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input, ViewChild } from "@angular/core";
import { Subscription } from "rxjs/Rx";
import { InitiativeComponent } from "../../initiative/initiative.component";

@Component({
    selector: "tooltip",
    template: require("./tooltip.component.html"),
    styles: [require("./tooltip.component.css").toString()],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TooltipComponent implements OnInit, OnDestroy {

    @Input("data")
    public initiative: Initiative;

    @ViewChild("initiative")
    public initiativeEditComponent: InitiativeComponent

    public subscription: Subscription;

    constructor(private uiService: UIService, private cd: ChangeDetectorRef) {
        this.update();
    }

    public update() {
        this.subscription = this.uiService.getTooltipData().subscribe(
            (initiatives: [Initiative,Initiative]) => {
                this.initiativeEditComponent.initiative = initiatives[0];
                this.initiativeEditComponent.parent = initiatives[1]
                this.initiativeEditComponent.ngOnInit();
                this.cd.markForCheck();
            },
            (error: any) => console.log(error));
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}