import { Angulartics2Mixpanel } from "angulartics2";
import { Subscription } from "rxjs/Rx";
import { UserFactory } from "./../../shared/services/user.factory";
import { Component, OnInit } from "@angular/core";
import { TeamFactory } from "../../shared/services/team.factory";
import { Auth } from "../../shared/services/auth/auth.service";
import { User } from "../../shared/model/user.data";
import { Team } from "../../shared/model/team.data";
import * as _ from "lodash"
import { UserService } from "../../shared/services/user/user.service";

@Component({
    selector: "teams-list",
    templateUrl: "./teams-list.component.html",
    styleUrls: ["./teams-list-component.css"]
})

export class TeamsListComponent implements OnInit {

    public user: User;
    public userSubscription2: Subscription;
    public userSubscription: Subscription;
    public teams$: Promise<Array<Team>>;
    public errorMessage: string;
    public isLoading: boolean;

    constructor(public auth: Auth, private teamFactory: TeamFactory, private userFactory: UserFactory, private userService: UserService, private analytics: Angulartics2Mixpanel) {
        this.isLoading = true;
        this.userSubscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user;
        })
        this.getTeams();
    }

    ngOnInit() {

    }

    ngOnDestroy(): void {
        if (this.userSubscription2) this.userSubscription2.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }


    createNewTeam(teamName: string) {
        this.teamFactory.create(new Team({ name: teamName, members: [this.user] }))
            .then((team: Team) => {
                this.user.teams.push(team.team_id);
                this.userFactory.upsert(this.user)
                    .then((result: boolean) => {
                        if (result) {
                            this.getTeams();
                            this.analytics.eventTrack("Create team", { email: this.user.email, name: teamName, teamId: team.team_id })
                        }
                        else {
                            return Promise.reject(`Unable to add you to team ${teamName}!`)
                        }
                    })
                    .catch((reason) => {
                        this.errorMessage = reason;
                    })
            },
            () => { return Promise.reject(`Unable to create team ${teamName}!`) })
            .catch((reason) => {
                this.errorMessage = reason;
            })
    }


    getTeams() {
        this.isLoading = true;
        this.userSubscription2 = this.auth.getUser().subscribe(
            (user: User) => {

                this.teams$ = Promise.all(
                    user.teams.map(
                        team_id => this.teamFactory.get(team_id).then(t => t, (reason) => { return Promise.reject(reason) }).catch(() => { return <Team>undefined })
                    )
                )
                    .then((teams: Array<Team>) => {
                        teams.forEach(t => {
                            if (t) {
                                this.userService.getUsersInfo(t.members).then((actualMembers: User[]) => {
                                    let allDeleted = _.differenceBy(t.members, actualMembers, m => m.user_id).map(m => { m.isDeleted = true; return m });
                                    return actualMembers.concat(allDeleted);
                                })
                                    .then(members => t.members = _.sortBy(members, m => m.name))
                            }
                        })
                        return teams.filter(t => { return t !== undefined });
                    })
                    .then(teams => { this.isLoading = false; return _.sortBy(teams, t => t.name) })
            })
    }

    trackByMemberId(index: number, member: User) {
        return member.user_id;
    }

    trackByTeamId(index: number, team: Team) {
        return team.team_id;
    }

}