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
    private routeSubscription: Subscription;
    private userSubscription: Subscription;
    public teams$: Promise<Array<Team>>;

    constructor(private auth: Auth, private teamFactory: TeamFactory, private userFactory: UserFactory) {
        this.userSubscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user;
        })
        this.getTeams();
    }

    ngOnInit() {
        // this.getTeams();
    }

    ngOnDestroy(): void {
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
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
        this.routeSubscription = this.auth.getUser().subscribe(
            (user: User) => {
                this.teams$ = Promise.all(
                    user.teams.map(
                        team_id => this.teamFactory.get(team_id).then(t => t, (reason) => { return Promise.reject(reason) }).catch(() => { return undefined })
                    )
                )
                    .then((teams: Array<Team>) => {
                        teams.forEach(t => {
                            if (t)
                                Promise.all(
                                    t.members.map(
                                        m => this.auth.getUserInfo(m.user_id)
                                            .then(m => m, (reason) => { return Promise.reject(reason) })
                                            .catch(() => { m.isDeleted = true; return m })))
                                    .then(members => t.members = members)

                        })
                        return teams;
                    })
                    .then((teams: Array<Team>) => {
                        return teams.filter(t => { return t !== undefined }).sort((a, b) => {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            return 0;
                        })
                    })
            })
    }

    trackByMemberId(index: number, member: User) {
        return member.user_id;
    }

    trackByTeamId(index: number, team: Team) {
        return team.team_id;
    }

}