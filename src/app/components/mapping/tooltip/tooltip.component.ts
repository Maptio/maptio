import { UIService } from "./../../../shared/services/ui/ui.service";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from "@angular/core";
import { Subscription } from "rxjs/Rx";

@Component({
    selector: "tooltip",
    template: require("./tooltip.component.html"),
    styles: [require("./tooltip.component.css").toString()],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TooltipComponent implements OnInit, OnDestroy {

    @Input("data")
    public initiative: Initiative;

    public subscription: Subscription;

    constructor(private uiService: UIService, private cd: ChangeDetectorRef) {
        this.update();
    }

    public update() {
        this.subscription = this.uiService.getTooltipData().subscribe(
            (initiative: Initiative) => {
                this.initiative = initiative;
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