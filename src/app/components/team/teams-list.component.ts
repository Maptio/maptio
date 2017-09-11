import { Subscription } from "rxjs/Rx";
import { UserFactory } from "./../../shared/services/user.factory";
import { Component, OnInit } from "@angular/core";
import { TeamFactory } from "../../shared/services/team.factory";
import { Auth } from "../../shared/services/auth/auth.service";
import { User } from "../../shared/model/user.data";
import { Team } from "../../shared/model/team.data";

@Component({
    selector: "teams-list",
    template: require("./teams-list.component.html"),
    styleUrls: ["./teams-list-component.css"]
})

export class TeamsListComponent implements OnInit {

    public user: User;
    private subscription: Subscription;
    public teams$: Promise<Array<Team>>;

    constructor(private auth: Auth, private teamFactory: TeamFactory, private userFactory: UserFactory) {

        this.auth.getUser().subscribe((user: User) => {
            this.user = user;
        })
    }

    ngOnInit() {
        this.getTeams();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }


    createNewTeam(teamName: string) {
        this.teamFactory.create(new Team({ name: teamName, members: [this.user] })).then((team: Team) => {
            this.user.teams.push(team.team_id);
            this.userFactory.upsert(this.user).then((result: boolean) => {
                this.getTeams();
            })
        })
    }


    getTeams() {
        this.subscription = this.auth.getUser().subscribe(
            (user: User) => {
                this.teams$ = Promise.all(
                    user.teams.map(
                        team_id => this.teamFactory.get(team_id)
                    )
                ).then((teams: Array<Team>) => {
                    return teams.sort((a, b) => {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    })
                })
            })
    }

}