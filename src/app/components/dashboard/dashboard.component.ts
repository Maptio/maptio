import { Subscription, Observable } from "rxjs/Rx";
import { Component, OnInit, Injectable, Input } from "@angular/core";
import { Auth } from "../../shared/services/auth/auth.service";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { TeamFactory } from "../../shared/services/team.factory";
import { ErrorService } from "../../shared/services/error/error.service";
import { User } from "../../shared/model/user.data";
import { DataSet } from "../../shared/model/dataset.data";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from "@angular/router";
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

    constructor(private route: ActivatedRoute) {
        console.log("constructor dashboard")
    }

    ngOnInit() {
        console.log("ngOnInit", this.route.snapshot.data)
        this.route.data
            .subscribe((data: { datasets: DataSet[] }) => {
                console.log(data)
                this.datasets = data.datasets;
            });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}