import { UserFactory } from "./../../shared/services/user.factory";
import { Observable,Subscription } from "rxjs/Rx";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { TeamFactory } from "./../../shared/services/team.factory";
import { ActivatedRoute, Params } from "@angular/router";
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

    team$: Promise<Team>
    public newMember: User;
    private searching: boolean = false;
    private searchFailed: boolean = false;
    public teamId: string;
    private subscription: Subscription;
    private existingTeamMembers: User[];

    constructor(private route: ActivatedRoute, private teamFactory: TeamFactory, private userFactory: UserFactory) {
        this.subscription = this.route.params.subscribe((params: Params) => {
            this.teamId = params["teamid"]
            this.teamFactory.get(this.teamId).then((team: Team) => {
                this.team$ = Promise.resolve(team);
                this.existingTeamMembers = team.members;
            });
        },
            error => { console.log(error) });
    }

    ngOnInit() {

    }

    saveNewMember(event: NgbTypeaheadSelectItemEvent) {
        this.newMember = event.item;
    }

    addMemberToTeam() {
        this.newMember.teams.push(this.teamId);
        this.userFactory.upsert(this.newMember).then((result: boolean) => {
            if (result) {
                this.teamFactory.get(this.teamId).then((team: Team) => {
                    team.members.push(this.newMember);
                    this.teamFactory.upsert(team).then((result) => {

                        // if (result) {
                        //     console.log("User " + this.newMember.name + " was successfully added to team " + this.teamId);
                        //     this.team$ = Promise.resolve(team);
                        // }
                    })
                });


            }
        })
    }

    searchUsers =
    (text$: Observable<string>) =>
        text$
            .debounceTime(300)
            .distinctUntilChanged()
            .do(() => this.searching = true)
            .switchMap(term =>
                this.userFactory.getAll(term).then((users: User[]) => {
                    this.searchFailed = false;
                    return users.filter(u => !this.existingTeamMembers.find(m => u.user_id === m.user_id));
                })

                    .catch(() => {
                        this.searchFailed = true;
                        return Observable.of([]);
                    })
            )
            .do(() => this.searching = false);


    formatter = (result: User) => result.name;

}