import { Validators } from "@angular/forms";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
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
import * as _ from "lodash"
import { UserService } from "../../shared/services/user/user.service";

@Component({
    selector: "team",
    templateUrl: "./team.component.html",
    styleUrls: ["./team.component.css"]
})
export class TeamComponent implements OnDestroy {

    public team$: Promise<Team>
    public members$: Promise<User[]>;
    public teams$: Promise<Team[]>
    public newMember: User;
    public searching: boolean = false;
    public searchFailed: boolean = false;
    public teamId: string;
    private routeSubscription: Subscription;
    private userSubscription: Subscription;
    public user: User;
    public userSearched: string;
    public isUserSearchedEmail: boolean;
    public isUserChosen: boolean = false;
    public isAlreadyInTeam: boolean = false;
    public errorMessage: string;

    public isLoading: boolean;

    public inviteForm: FormGroup;

    private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    constructor(public auth: Auth, private userService: UserService, private route: ActivatedRoute, private teamFactory: TeamFactory, private userFactory: UserFactory, private datasetFactory: DatasetFactory) {

        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            if (!params["teamid"]) return
            this.teamId = params["teamid"]
            this.team$ = this.teamFactory.get(this.teamId);
            this.members$ = this.getAllMembers();
        },
            error => { console.log(error) });

        this.userSubscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user;
        })

        this.inviteForm = new FormGroup({
            "firstname": new FormControl("", [
                Validators.required,
                Validators.minLength(2)
            ]),
            "lastname": new FormControl("", [
                Validators.required,
                Validators.minLength(2)
            ]),
            // "isInvited": new FormControl("", [
            // ])
        });

    }

    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    getAllMembers() {
        this.isLoading = true;
        return this.team$.then((team: Team) => {
            // console.log(team.members)
            return this.userFactory.getUsers(team.members.map(m => m.user_id))
                .then(members => _.compact(members))
                .then((members: User[]) => {
                    // console.log("asking for ", members.map(u => { console.log(u.user_id) }))
                    return this.userService.getUsersInfo(members).then(pending => {
                        // console.log("got ", pending.map(u => { console.log(u.user_id) }))
                        return { members: members, membersPending: pending }
                    })
                })
                .then((result) => {
                    let members = result.members;
                    let membersPending = result.membersPending;
                    // console.log(members, membersPending);
                    let allDeleted = _.differenceBy(members, membersPending, m => m.user_id).map(m => { m.isDeleted = true; return m });
                    return membersPending.concat(allDeleted);
                })
                .then(members => { this.isLoading = false; return _.sortBy(members, m => m.name) })
        });
    }


    saveNewMember(event: NgbTypeaheadSelectItemEvent) {

        this.newMember = event.item;
        this.isUserChosen = true;
    }

    addMemberToTeam() {
        this.newMember.teams.push(this.teamId);

        this.userFactory.upsert(this.newMember)
            .then((result: boolean) => {
                return result;
            })
            .then((result: boolean) => {
                if (result) {
                    return this.team$.then((team: Team) => {
                        team.members.push(this.newMember);
                        return team
                    });
                }
            })
            .then((newTeam: Team) => {
                return this.teamFactory.upsert(newTeam).then((result) => {
                    this.newMember = undefined;
                    return result
                })
            })
            .then(() => {
                this.members$ = this.getAllMembers();
            })
    }


    isEmail(text: string) {
        // console.log(text, this.EMAIL_REGEXP, this.EMAIL_REGEXP.test(text))
        return this.EMAIL_REGEXP.test(text);
    }


    inviteAll() {
        // console.log("invite all")
        this.members$ = this.members$
            .then((users: User[]) => {
                return users.map((user: User) => {
                    if (user.isActivationPending) {
                        // console.log("invite", user.email)
                        this.inviteUser(user);
                        // user.isInvitationSent = true; // optimistic update
                    }
                    return user;
                })
            });
    }

    inviteUser(user: User): Promise<void> {

        return this.team$.then((team: Team) => {
            return this.userService.sendInvite(user.email, user.user_id, user.firstname, user.lastname, user.name, team.name, this.user.name)
                .then((isSent) => {
                    user.isInvitationSent = isSent;
                    return;
                }
                )
        })
    }

    deleteMember(user: User) {
        // console.log("deleting", user.email)
        this.team$.then((team: Team) => {
            _.remove(team.members, function (m) { return m.user_id === user.user_id })
            this.teamFactory.upsert(team).then(() => { this.members$ = this.getAllMembers(); })
        })

    }

    createUser(email: string) {
        if (this.inviteForm.dirty && this.inviteForm.valid) {

            let firstname = this.inviteForm.controls["firstname"].value
            let lastname = this.inviteForm.controls["lastname"].value
            // let isInvited = this.inviteForm.controls["isInvited"].value

            // console.log(email, firstname, lastname, isInvited)
            // return;

            this.members$ = this.team$.then((team: Team) => {

                return this.userService.createUser(email, firstname, lastname)
                    .then((user: User) => {
                        return this.datasetFactory.get(team).then((datasets: DataSet[]) => {
                            let virtualUser = new User();
                            virtualUser.name = user.name;
                            virtualUser.email = user.email;
                            virtualUser.firstname = user.firstname;
                            virtualUser.lastname = user.lastname;
                            virtualUser.nickname = user.nickname;
                            virtualUser.user_id = user.user_id;
                            virtualUser.picture = user.picture;
                            virtualUser.teams = [this.teamId];
                            virtualUser.datasets = datasets.map(d => d._id);
                            return virtualUser;
                        }, (reason) => {
                            return Promise.reject(`Can't create ${email} : ${reason}`);
                        })
                    })
                    // .then((user: User) => {
                    //     if (isInvited) {
                    //         // console.log("sending invite to ", user.email, user.user_id, user.name)
                    //         return this.inviteUser(user).then(() => { return user })
                    //     }
                    //     else {
                    //         return user;
                    //     }
                    // }, (reason) => {
                    //     return Promise.reject(`Can't invite ${email} : ${reason}`)
                    // })
                    .then((virtualUser: User) => {
                        // console.log("create virtual user", virtualUser)
                        this.userFactory.create(virtualUser)
                        return virtualUser;
                    })
                    .then((user: User) => {
                        team.members.push(user);
                        this.teamFactory.upsert(team).then((result) => {
                            this.newMember = undefined;
                            this.searchFailed = false;
                        })
                    })
                    .then(() => {
                        return this.getAllMembers();
                    })
                    .catch((reason) => {
                        this.errorMessage = reason;
                    })
            })
        }

    }

    searchUsers =
    (text$: Observable<string>) =>
        text$
            .debounceTime(500)
            .distinctUntilChanged()
            .filter(text => this.isEmail(text))
            .do(() => { this.searching = true; this.isAlreadyInTeam = false; this.inviteForm.reset() })
            .switchMap(term =>
                Observable.fromPromise(

                    this.userFactory.getAll(term)
                        .then((users: User[]) => {
                            this.userSearched = term;
                            return this.members$.then((existingMembers: User[]) => {
                                // console.log(existingMembers)
                                let alreadyInTeam = existingMembers.filter(m => m.email === term);
                                let availableToChoose = users.filter(u => !existingMembers.find(m => u.user_id === m.user_id));

                                return [alreadyInTeam, availableToChoose]
                            })
                        })
                        .then(([alreadyInTeam, availableToChoose]: [User[], User[]]) => {
                            // console.log(alreadyInTeam, availableToChoose)
                            if (alreadyInTeam.length > 0) {
                                this.isAlreadyInTeam = true;
                                this.searchFailed = false;
                                return [];
                            }
                            else {
                                if (availableToChoose.length === 0) {
                                    this.isUserSearchedEmail = this.isEmail(term);
                                    // this.userSearched = Promise.resolve(term);

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
                        this.isUserSearchedEmail = this.isEmail(term);
                        // this.userSearched = Promise.resolve(term);
                        this.userSearched = term;
                        this.searchFailed = true;
                        return Observable.of([]);
                    })
            )
            .do(() => this.searching = false);

    formatter = (result: User) => `${result.email} (${result.name})`;

    trackByMemberId(index: number, member: User) {
        return member.user_id;
    }

}