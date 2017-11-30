import { Subscription} from "rxjs/Rx";
import { Component } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { DashboardComponentResolver } from "./dashboard.resolver";

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    datasets: DataSet[];
    public subscription: Subscription;
    public isLoading: boolean;

    constructor(private resolver: DashboardComponentResolver) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.subscription = this.resolver.resolve(undefined, undefined)
            .subscribe((datasets: DataSet[]) => {
                this.datasets = datasets;
                this.isLoading = false;
            },
            (error: any) => { this.isLoading = false; },
            () => { this.isLoading = false; });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}