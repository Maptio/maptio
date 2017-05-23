import { Subscription } from 'rxjs/Rx';
import { TeamFactory } from './../../shared/services/team.factory';
import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Team } from "../../shared/model/team.data";
import { User } from "../../shared/model/user.data";

@Component({
    selector: "team",
    template: require("./team.component.html").toString()
})
export class TeamComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
       this.subscription.unsubscribe();
    }

    subscription:Subscription;
    team$: Promise<Team>

    constructor(private route: ActivatedRoute, private teamFactory: TeamFactory) {
        this.subscription = this.route.params.subscribe((params: Params) => {
            let teamId = params["teamid"]
            this.teamFactory.get(teamId).then((team: Team) => {
                // console.log("team.compoennt.ts", teamId, team.name, team.members.length)
                this.team$ = Promise.resolve(team);
            });
        },
            error => { console.log(error) });
    }

    ngOnInit() {



    }

}