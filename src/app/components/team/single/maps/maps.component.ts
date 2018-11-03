import { Team } from "./../../../../shared/model/team.data";
import { DataSet } from "./../../../../shared/model/dataset.data";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Auth } from "../../../../shared/services/auth/auth.service";
import { User } from "../../../../shared/model/user.data";
import { Angulartics2Mixpanel } from "angulartics2";
import { Permissions } from "../../../../shared/model/permission.data";

@Component({
    selector: "team-single-maps",
    templateUrl: "./maps.component.html",
    styleUrls: ["./maps.component.css"]
})
export class TeamMapsComponent implements OnInit {

    public datasets: DataSet[];
    public teams: Team[];
    public user:User;
    Permissions=Permissions;

    constructor(private route: ActivatedRoute, private auth: Auth, private cd:ChangeDetectorRef,private analytics: Angulartics2Mixpanel) {

    }
    ngOnInit() {
        this.route.parent.data
            .combineLatest(this.auth.getUser())
            .subscribe(([data, user] : [{ assets: { team: Team, datasets: DataSet[] } }, User]) => {
                console.log(data, user)
                this.datasets = data.assets.datasets;
                this.teams = [data.assets.team];
                this.user = user;
                this.cd.markForCheck();
            });
    }

    onNewMap(dataset:DataSet){
        console.log(dataset)
        this.analytics.eventTrack("Create a map", { email: this.user.email, name: dataset.initiative.name, team: dataset.initiative.team_id })

        this.ngOnInit();
    }

    archiveMap(dataset: DataSet) {
        // console.log("archive", dataset.initiative.name)
    }

}