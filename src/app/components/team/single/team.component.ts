import { User } from "./../../../shared/model/user.data";
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

    constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {
        console.log()
    }

    ngOnInit() {
        this.routeSubscription = this.route.data
            .subscribe((data: any) => {

                console.log("team single", data)
                this.team = data.team;
                this.cd.markForCheck();
            });
    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
    }



}

