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
        this.subscription.unsubscribe();
    }

    private team$: Promise<Team>
    private members$: Promise<User[]>;
    private teams$: Promise<Team[]>
    public newMember: User;
    private searching: boolean = false;
    private searchFailed: boolean = false;
    public teamId: string;
    private subscription: Subscription;
    // private existingTeamMembers: User[];
    private user: User;
    public userSearched: string;
    public isUserSearchedEmail: boolean;
    public isUserChosen: boolean = false;
    public isAlreadyInTeam: boolean = false;


    private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    constructor(private auth: Auth, private route: ActivatedRoute, private teamFactory: TeamFactory, private userFactory: UserFactory, private datasetFactory: DatasetFactory) {

        this.subscription = this.route.params.subscribe((params: Params) => {
            if (!params["teamid"]) return
            this.teamId = params["teamid"]
            this.team$ = this.teamFactory.get(this.teamId);
            this.members$ = this.getAllMembers();
        },
            error => { console.log(error) });

        this.auth.getUser().subscribe((user: User) => {
            this.user = user;
        })
    }

    getAllMembers() {
        console.log("get all members")
        return this.team$.then((team: Team) => {
            return Promise.all(
                team.members.map(user => this.userFactory.get(user.user_id)))
                .then((members: User[]) => {
                    members.forEach(m => {
                        console.log("member updating", m.email, m.isInvitationSent)
                        this.auth.isActivationPending(m.user_id).then(is => { m.isActivationPending = is });
                        this.auth.isInvitationSent(m.user_id).then(is => m.isInvitationSent = is);
                        console.log("member updated", m.email, m.isInvitationSent)
                    })
                    return members.sort((a: User, b: User) => {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;

                    });
                })
        });
    }


    saveNewMember(event: NgbTypeaheadSelectItemEvent) {

        this.newMember = event.item;
        this.isUserChosen = true;
    }

    addMemberToTeam() {
        this.newMember.teams.push(this.teamId);
        this.userFactory.upsert(this.newMember).then((result: boolean) => {
            if (result) {
                this.teamFactory.get(this.teamId).then((team: Team) => {
                    team.members.push(this.newMember);
                    this.teamFactory.upsert(team).then((result) => {
                        // this.getAllTeams();
                        this.members$ = this.getAllMembers();
                        this.newMember = undefined;
                    })
                });

            }

        })
    }



    isEmail(text: string) {
        console.log(text, this.EMAIL_REGEXP, this.EMAIL_REGEXP.test(text))
        return this.EMAIL_REGEXP.test(text);
    }


    inviteAll() {
        console.log("invite all")
        this.members$ = this.members$
            .then((users: User[]) => {
                return users.map((user: User) => {
                    if (user.isActivationPending) {
                        console.log("invite", user.email)
                        this.inviteUser(user);
                        user.isInvitationSent = true; // optimistic update
                    }
                    return user;
                })
            });
    }

    inviteUser(user: User) {

        this.team$.then((team: Team) => {
            console.log("invite", user.email, user.user_id, user.name, team.name, this.user.name)
            this.auth.sendInvite(user.email, user.user_id, user.name, team.name, this.user.name)
        })
    }

    createUser(name: string, email: string, isInvited: boolean) {
        console.log("create", name, email, isInvited);
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

                        if (isInvited) {
                            console.log("sending invite to ", user.email, user.user_id, user.name)
                            this.inviteUser(user)
                        }
                        return user;
                    })
                    .then((virtualUser: User) => {
                        console.log("create virtual user", virtualUser)
                        this.userFactory.create(virtualUser).then(() => {
                            this.teamFactory.get(this.teamId).then((team: Team) => {
                                team.members.push(virtualUser);
                                this.teamFactory.upsert(team).then((result) => {
                                    // this.getAllTeams();
                                    this.members$ = this.getAllMembers();
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
            .debounceTime(500)
            .distinctUntilChanged()
            .filter(text => this.isEmail(text))
            .do(() => { this.searching = true; this.isAlreadyInTeam = false; })
            .switchMap(term =>
                Observable.fromPromise(

                    this.userFactory.getAll(term)
                        .then((users: User[]) => {
                            return this.members$.then((existingMembers: User[]) => {
                                console.log(existingMembers)
                                let alreadyInTeam = existingMembers.filter(m => m.email === term);
                                let availableToChoose = users.filter(u => !existingMembers.find(m => u.user_id === m.user_id));

                                return [alreadyInTeam, availableToChoose]
                            })
                        })
                        .then(([alreadyInTeam, availableToChoose]: [User[], User[]]) => {
                            console.log(alreadyInTeam, availableToChoose)
                            if (alreadyInTeam.length > 0) {
                                this.isAlreadyInTeam = true;
                                this.searchFailed = false;
                                return [];
                            }
                            else {
                                if (availableToChoose.length === 0) {
                                    this.userSearched = term;
                                    this.isUserSearchedEmail = this.isEmail(this.userSearched);
                                    this.searchFailed = true;
                                    throw new Error()
                                }
                                else {
                                    return availableToChoose;
                                }
                            }
                        })
                    // .catch(err => { throw new Error(err) })

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

    formatter = (result: User) => `${result.email} (${result.name})`;

}