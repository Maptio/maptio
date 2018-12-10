import { Team } from "./../../../../shared/model/team.data";
import { DataSet } from "./../../../../shared/model/dataset.data";
import { ActivatedRoute , Router} from "@angular/router";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Auth } from "../../../../shared/services/auth/auth.service";
import { User } from "../../../../shared/model/user.data";
import { Angulartics2Mixpanel } from "angulartics2";
import { Permissions } from "../../../../shared/model/permission.data";
import {sortBy} from "lodash";

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

    constructor(private route: ActivatedRoute, private auth: Auth, private cd:ChangeDetectorRef,private analytics: Angulartics2Mixpanel,
    private router:Router) {

    }
    ngOnInit() {
        this.route.parent.data
            .combineLatest(this.auth.getUser())
            .subscribe(([data, user] : [{ assets: { team: Team, datasets: DataSet[] } }, User]) => {
                this.datasets = sortBy(data.assets.datasets, d => !!d.isArchived).map(d => {d.team = data.assets.team; return d});
                this.teams = [data.assets.team];
                this.user = user;
                this.cd.markForCheck();
            });
    }

    onNewMap(dataset:DataSet){
        this.analytics.eventTrack("Create a map", { email: this.user.email, name: dataset.initiative.name, team: dataset.initiative.team_id })

        this.ngOnInit();
    }

    onArchive(dataset: DataSet) {
        this.ngOnInit();
    }

    onRestore(dataset: DataSet) {
        this.ngOnInit();

    }

}