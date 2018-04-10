import { DataSet } from './../../../shared/model/dataset.data';
import { Permissions } from "./../../../shared/model/permission.data";
import { ActivatedRoute } from "@angular/router";
import { Team } from "./../../../shared/model/team.data";
import { Subscription } from "rxjs/Rx";
import { OnInit } from "@angular/core";
import { Component, ChangeDetectorRef } from "@angular/core";


@Component({
    selector: "team",
    templateUrl: "./team.component.html",
    styleUrls: ["./team.component.css"]
})
export class TeamComponent implements OnInit {
    routeSubscription: Subscription;

    team: Team;
    Permissions = Permissions;

    constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.routeSubscription = this.route.data
            .subscribe((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                console.log(data)
                this.team = data.assets.team;
                this.cd.markForCheck();
            });
    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
    }



}

