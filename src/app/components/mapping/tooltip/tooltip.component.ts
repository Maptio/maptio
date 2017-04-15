import { UIService } from "./../../../shared/services/ui.service";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";

@Component({
	selector: "tooltip",
	template: require("./tooltip.component.html"),
	styles: [require("./tooltip.component.css").toString()],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class TooltipComponent implements OnInit, OnDestroy {

	private initiative: Initiative;

	private subscription: any;

	constructor(private uiService: UIService, private cd: ChangeDetectorRef) {
		this.subscription = uiService.getTooltipData().subscribe(
			(initiative: Initiative) => {
				this.initiative = initiative;
				cd.markForCheck();
			},
			(error: any) => console.log(error));
	}

	ngOnInit() {

	}


	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}