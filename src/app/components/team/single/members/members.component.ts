import { Auth } from "./../../../../shared/services/auth/auth.service";
import { Observable } from "rxjs/Rx";
import { DataSet } from "./../../../../shared/model/dataset.data";
import { DatasetFactory } from "./../../../../shared/services/dataset.factory";
import { remove } from "lodash";
import { Angulartics2Mixpanel } from "angulartics2";
import { TeamFactory } from "./../../../../shared/services/team.factory";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { sortBy } from "lodash";
import { differenceBy } from "lodash";
import { uniqBy } from "lodash";
import { UserService } from "./../../../../shared/services/user/user.service";
import { compact } from "lodash";
import { User } from "./../../../../shared/model/user.data";
import { Team } from "./../../../../shared/model/team.data";
import { Subscription } from "rxjs/Subscription";
import { UserFactory } from "./../../../../shared/services/user.factory";
import { FormControl } from "@angular/forms";
import { Validators } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { UserRole, Permissions } from "../../../../shared/model/permission.data";

@Component({
    selector: "team-single-members",
    templateUrl: "./members.component.html",
    styleUrls: ["./members.component.css"]
})
export class TeamMembersComponent implements OnInit {

    team: Team;
    user: User;
    UserRole = UserRole;
    Permissions = Permissions;

    public members$: Promise<User[]>;
    public newMember: User;
    public searching: boolean = false;
    public searchFailed: boolean = false;
    private routeSubscription: Subscription;
    private userSubscription: Subscription;
    public userSearched: string;
    public isUserSearchedEmail: boolean;
    public isUserChosen: boolean = false;
    public isAlreadyInTeam: boolean = false;
    public errorMessage: string;

    public resentMessage: string;
    public isLoading: boolean;
    public isAddUserToggled: boolean;

    public createdUser: User;
    public inviteForm: FormGroup;

    isSendingMap: Map<string, boolean> = new Map<string, boolean>();

    private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


    constructor(
        private route: ActivatedRoute,
        private userFactory: UserFactory,
        private userService: UserService,
        private teamFactory: TeamFactory,
        private datasetFactory: DatasetFactory,
        private analytics: Angulartics2Mixpanel,
        private cd: ChangeDetectorRef,
        private auth: Auth) {
        this.inviteForm = new FormGroup({
            "firstname": new FormControl("", [
                Validators.required,
                Validators.minLength(2)
            ]),
            "lastname": new FormControl("", [
                Validators.required,
                Validators.minLength(2)
            ])
        });

    }

    ngOnInit() {
        this.routeSubscription = this.route.parent.data
            .subscribe((data: { team: Team }) => {
                this.team = data.team;
            });

        this.userSubscription = this.auth.getUser().subscribe(u => this.user = u);
        this.members$ = this.getAllMembers();
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

    getAllMembers() {
        this.isLoading = true;
        // return this.team$.then((team: Team) => {
        // console.log(team.members)
        return this.userFactory.getUsers(this.team.members.map(m => m.user_id))
            .then(members => compact(members))
            .then((members: User[]) => {
                // console.log("asking for ", members.map(u => { console.log(u.user_id) }))
                return this.userService.getUsersInfo(members).then(pending => {
                    // console.log("got ", pending.map(u => { console.log(u.user_id) }))
                    if (this.createdUser) {
                        this.createdUser.isActivationPending = true;
                        this.createdUser.isInvitationSent = false;
                        pending.push(this.createdUser)
                    }

                    return { members: members, membersPending: pending }
                })
            })
            .then((result) => {
                let members = result.members;

                let membersPending = uniqBy(result.membersPending, m => m.user_id);
                // console.log(members, membersPending);
                let allDeleted = differenceBy(members, membersPending, m => m.user_id).map(m => { m.isDeleted = true; return m });

                return membersPending.concat(allDeleted);
            })
            .then(members => {
                this.isLoading = false;
                members.forEach(m => {
                    this.isSendingMap.set(m.user_id, false);
                })
                this.cd.markForCheck();
                return sortBy(members, m => m.name)
            })
        // });
    }


    isDisplayLoader(user_id: string) {
        return this.isSendingMap.get(user_id)
    }

    saveNewMember(event: NgbTypeaheadSelectItemEvent) {

        this.newMember = event.item;
        this.isUserChosen = true;
    }

    addMemberToTeam() {
        this.newMember.teams.push(this.team.team_id);

        this.userFactory.upsert(this.newMember)
            .then((result: boolean) => {
                return result;
            })
            .then((result: boolean) => {
                if (result) {
                    // return this.team$.then((team: Team) => {
                    this.team.members.push(this.newMember);
                    return this.team
                    // });
                }
            })
            .then((newTeam: Team) => {
                return this.teamFactory.upsert(newTeam).then((result) => {
                    this.newMember = undefined;
                    return newTeam;
                })
            })
            .then((team: Team) => {
                this.analytics.eventTrack("Team", { action: "add", team: team.name, teamId: team.team_id })
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
        this.isSendingMap.set(user.user_id, true);
        // return this.team$.then((team: Team) => {
        return this.userService.sendInvite(user.email, user.user_id, user.firstname, user.lastname, user.name, this.team.name, this.user.name)
            .then((isSent) => {
                user.isInvitationSent = isSent;
                this.isSendingMap.set(user.user_id, false);
                this.cd.markForCheck();
                this.analytics.eventTrack("Team", { action: "invite", team: this.team.name, teamId: this.team.team_id })
                return;
            }
            )
        // })
    }

    resendUser(user: User): Promise<void> {
        return this.inviteUser(user).then(() => {
            this.resentMessage = `Invitation email successfully sent to ${user.email}.`;
        })
    }

    deleteMember(user: User) {
        // console.log("deleting", user.email)
        // this.team$.then((team: Team) => {
        remove(this.team.members, function (m) { return m.user_id === user.user_id });
        this.cd.markForCheck();
        this.teamFactory.upsert(this.team).then(() => { this.members$ = this.getAllMembers(); })
        // })

    }

    createUser(email: string) {
        if (this.inviteForm.dirty && this.inviteForm.valid) {

            let firstname = this.inviteForm.controls["firstname"].value
            let lastname = this.inviteForm.controls["lastname"].value

            this.createUserFullDetails(email, firstname, lastname)
                .then(() => {
                    this.members$ = this.getAllMembers();
                });
        }
    }

    createUserFullDetails(email: string, firstname: string, lastname: string) {
        // return this.team$.then((team: Team) => {

        // })

        return this.userService.createUser(email, firstname, lastname)
            .then((user: User) => {
                return this.datasetFactory.get(this.team).then((datasets: DataSet[]) => {
                    let virtualUser = new User();
                    virtualUser.name = user.name;
                    virtualUser.email = user.email;
                    virtualUser.firstname = user.firstname;
                    virtualUser.lastname = user.lastname;
                    virtualUser.nickname = user.nickname;
                    virtualUser.user_id = user.user_id;
                    virtualUser.picture = user.picture;
                    virtualUser.teams = [this.team.team_id];
                    virtualUser.datasets = datasets.map(d => d.datasetId);
                    this.createdUser = virtualUser;

                    return virtualUser;
                }, (reason) => {
                    return Promise.reject(`Can't create ${email} : ${reason}`);
                })
            }, (reason: any) => {
                // console.log("reject", JSON.parse(reason._body).message)
                throw JSON.parse(reason._body).message;
            })
            .then((virtualUser: User) => {
                this.userFactory.create(virtualUser)
                return virtualUser;
            })
            .then((user: User) => {
                this.team.members.push(user);
                this.teamFactory.upsert(this.team).then((result) => {
                    this.newMember = undefined;
                    this.searchFailed = false;
                })
            })
            .then(() => {
                this.analytics.eventTrack("Team", { action: "create", team: this.team.name, teamId: this.team.team_id });
                return true;
            })
            .catch((reason) => {
                // console.log("catching ", reason)
                this.errorMessage = reason;
                throw Error(reason);
            })

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

    changeUserRole(user: User, userRole: UserRole) {
        this.isSendingMap.set(user.user_id, true)
        this.userService.updateUserRole(user.user_id, UserRole[userRole]).then(() => {
            this.isSendingMap.set(user.user_id, false);
            this.cd.markForCheck();
        })
    }
}
