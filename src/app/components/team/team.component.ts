import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { UserFactory } from "./../../shared/services/user.factory";
import { Observable, Subscription } from "rxjs/Rx";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { TeamFactory } from "./../../shared/services/team.factory";
import { ActivatedRoute, Params } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Team } from "../../shared/model/team.data";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { UUID } from "angular2-uuid";
import { DataSet } from "../../shared/model/dataset.data";

@Component({
    selector: "team",
    template: require("./team.component.html").toString(),
    styleUrls: ["./team.component.css"]
})
export class TeamComponent implements OnDestroy {
    ngOnDestroy(): void {
        this.subscription1.unsubscribe();
        this.subscription2.unsubscribe();
    }

    private team$: Promise<Team>
    private members$: Promise<User[]>;
    private teams$: Promise<Team[]>
    public newMember: User;
    private searching: boolean = false;
    private searchFailed: boolean = false;
    public teamId: string;
    private subscription1: Subscription;
    private subscription2: Subscription;
    private existingTeamMembers: User[];
    private user: User;
    public userSearched: string;
    public isUserSearchedEmail: boolean;


    public range: number = 5;
    public start: number = 0;
    public end: number = this.range;

    private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    constructor(private auth: Auth, private route: ActivatedRoute, private teamFactory: TeamFactory, private userFactory: UserFactory, private datasetFactory: DatasetFactory) {
        this.getAllTeams();
        this.subscription2 = this.route.params.subscribe((params: Params) => {
            if (!params["teamid"]) return
            this.teamId = params["teamid"]
            this.getAllMembers();
        },
            error => { console.log(error) });

        this.auth.getUser().subscribe((user: User) => {
            this.user = user;
        })
    }

    forward() {
        this.start += this.range;
        this.end += this.range;
    }

    backward() {
        this.start -= this.range;
        this.end -= this.range;
    }

    getAllMembers() {
        this.team$ = this.teamFactory.get(this.teamId).then((team: Team) => {

            this.members$ = Promise.all(team.members.map(user => this.userFactory.get(user.user_id)))

            // this.members$ = Promise.all()
            this.existingTeamMembers = team.members;
            return team;
        });
    }

    getAllTeams() {
        this.subscription1 = this.auth.getUser().subscribe(
            (user: User) => {
                this.teams$ = Promise.all(
                    user.teams.map(
                        team_id => this.teamFactory.get(team_id).then((resolved: Team) => { return resolved })
                    )
                )
                    .then(teams => { return teams });
            })
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
                        this.getAllTeams();
                        this.getAllMembers();
                        this.newMember = undefined;
                    })
                });

            }

        })
    }

    createNewTeam(teamName: string) {
        this.teamFactory.create(new Team({ name: teamName, members: [this.user] })).then((team: Team) => {
            this.user.teams.push(team.team_id);
            this.userFactory.upsert(this.user).then((result: boolean) => {
                this.getAllTeams();
            })

        })

    }

    isEmail(text: string) {
        console.log(text, this.EMAIL_REGEXP, this.EMAIL_REGEXP.test(text))
        return this.EMAIL_REGEXP.test(text);
    }

    createUser(name: string, email: string) {

        this.team$.then((team: Team) => {
            this.auth.createUser(email, name).then((user: User) => {
                this.datasetFactory.get(team).then((datasets: DataSet[]) => {
                    let virtualUser = new User();
                    virtualUser.name = user.name;
                    virtualUser.email = user.email;
                    virtualUser.nickname = user.nickname;
                    virtualUser.user_id = user.user_id;
                    virtualUser.picture = user.picture;
                    virtualUser.teams = [this.teamId];
                    virtualUser.datasets = datasets.map(d => d._id);
                    console.log("build virtual user", virtualUser)
                    return virtualUser;
                })
                    .then((user: User) => {
                        console.log("sending invite to ", user.email, user.user_id, user.name)
                        this.auth.sendInvite(user.email, user.user_id, user.name, team.name, this.user.name);
                        return user;
                    })

                    .then((virtualUser: User) => {
                        console.log("create virtual user", virtualUser)
                        this.userFactory.create(virtualUser).then(() => {
                            this.teamFactory.get(this.teamId).then((team: Team) => {
                                team.members.push(virtualUser);
                                this.teamFactory.upsert(team).then((result) => {
                                    this.getAllTeams();
                                    this.getAllMembers();
                                    this.newMember = undefined;
                                    this.searchFailed = false;
                                })
                            });
                        });
                    })
            })
        })
    }

    searchUsers =
    (text$: Observable<string>) =>
        text$
            .debounceTime(300)
            .distinctUntilChanged()
            .do(() => this.searching = true)
            .switchMap(term =>
                Observable.fromPromise(
                    this.userFactory.getAll(term).then((users: User[]) => {
                        return users.filter(u => !this.existingTeamMembers.find(m => u.user_id === m.user_id));
                    }).then((users: User[]) => {
                        if (users.length === 0) {
                            throw new Error("No user email matching that pattern")
                        }
                        else
                            return users;
                    })
                )
                    .do(() => {
                        this.searchFailed = false;
                    })
                    .catch(() => {
                        this.userSearched = term;
                        this.isUserSearchedEmail = this.isEmail(this.userSearched);
                        this.searchFailed = true;
                        return Observable.of([]);
                    })
            )
            .do(() => this.searching = false);

    formatter = (result: User) => result.nickname;

}