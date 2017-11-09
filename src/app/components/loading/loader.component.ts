import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { LoaderService, LoaderState } from "../../shared/services/loading/loader.service";

@Component({
    selector: "loader",
    templateUrl: "./loader.component.html",
    styleUrls: ["loader.component.css"]
})
export class LoaderComponent implements OnInit {
    show = false;
    public subscription: Subscription;
    constructor(
        private loaderService: LoaderService
    ) { }

    ngOnInit() {
        this.subscription = this.loaderService.loaderState
            .subscribe((state: LoaderState) => {
                this.show = state.show;
            });
    }

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }
}