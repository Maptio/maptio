import { environment } from './../../../../../environment/environment';
import { Auth } from "./../../../../shared/services/auth/auth.service";
import { Observable, Subject } from "rxjs/Rx";
import { DataSet } from "./../../../../shared/model/dataset.data";
import { DatasetFactory } from "./../../../../shared/services/dataset.factory";
import { remove } from "lodash";
import { Angulartics2Mixpanel } from "angulartics2";
import { TeamFactory } from "./../../../../shared/services/team.factory";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { sortBy, isEmpty } from "lodash";
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
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { UserRole, Permissions } from "../../../../shared/model/permission.data";
import { LoaderService } from '../../../../shared/services/loading/loader.service';
import { Intercom } from 'ng-intercom';

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
    private routeSubscription: Subscription;
    private userSubscription: Subscription;
    private inputEmailSubscription: Subscription;
    public isAlreadyInTeam: boolean = false;
    public errorMessage: string;

    public resentMessage: string;
    public isCreatingUser: boolean;
    public invitableUsersCount: number;

    public createdUser: User;
    public inviteForm: FormGroup;
    cancelClicked: boolean;

    isSendingMap: Map<string, boolean> = new Map<string, boolean>();
    isUpdatingMap: Map<string, boolean> = new Map<string, boolean>();
    inputEmail$: Subject<string> = new Subject();
    inputEmail: String;
    foundUser: User;
    isShowSelectToAdd: Boolean;
    isShowInviteForm: Boolean;
    isSearching: Boolean;
    isNewUserAdded: Boolean;

    private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

    constructor(
        private route: ActivatedRoute,
        private userFactory: UserFactory,
        private userService: UserService,
        private teamFactory: TeamFactory,
        private datasetFactory: DatasetFactory,
        private analytics: Angulartics2Mixpanel,
        private intercom: Intercom,
        private cd: ChangeDetectorRef,
        private loaderService: LoaderService,
        private auth: Auth) {
        this.inviteForm = new FormGroup({
            "firstname": new FormControl("", {
                validators: [
                    Validators.required,
                    Validators.minLength(2)
                ],
                updateOn: "submit"
            }),
            "lastname": new FormControl("", {
                validators: [
                    Validators.required,
                    Validators.minLength(2)
                ],
                updateOn: "submit"
            }),
        });

    }


    @ViewChild("inputNewMember") public inputNewMember: ElementRef;

    ngOnInit() {
        this.routeSubscription = this.route.parent.data
            .subscribe((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                this.team = data.assets.team;
            });

        this.inputEmailSubscription = this.inputEmail$
            .debounceTime(250)
            .do(() => {
                this.isAlreadyInTeam = false;
                this.isShowSelectToAdd = false;
                this.isShowInviteForm = false;
                this.cd.markForCheck();
            })
            .filter(email => this.isEmail(email))
            .do((email: string) => {
                this.inputEmail = email;
                this.isSearching = true;
                this.cd.markForCheck();
            })
            .flatMap(email => {
                return this.userFactory.getAll(email)
            }).subscribe((users: User[]) => {
                if (!isEmpty(users)) {
                    this.foundUser = users[0];
                    this.isShowSelectToAdd = true;
                    this.isShowInviteForm = false;
                } else {
                    this.isShowSelectToAdd = false;
                    this.isShowInviteForm = true;
                }
                this.isSearching = false;
                this.cd.markForCheck();
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
        if (this.inputEmailSubscription) {
            this.inputEmailSubscription.unsubscribe();
        }
    }

    getAllMembers() {
        this.loaderService.show();
        return this.userFactory.getUsers(this.team.members.map(m => m.user_id))
            .then(members => compact(members))
            .then((members: User[]) => {
                return this.userService.getUsersInfo(members).then(pending => {
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
                let allDeleted = differenceBy(members, membersPending, m => m.user_id)//.map(m => { m.isDeleted = true; return m });

                return membersPending.concat(allDeleted);
            })
            .then((members) => {
                this.invitableUsersCount = members.filter(m => m.isActivationPending).length;
                return members
            })
            .then(members => {
                this.loaderService.hide();
                members.forEach(m => {
                    this.isSendingMap.set(m.user_id, false);
                    this.isUpdatingMap.set(m.user_id, false)
                })
                this.cd.markForCheck();
                return sortBy(members, m => m.name)
            })
            .catch(() => {
                this.cd.markForCheck();
                this.loaderService.hide();
                return []
            })
        // });
    }

    isUserInTeam(newUser: User) {
        return this.team.members.findIndex(m => m.user_id === newUser.user_id) >= 0;
    }

    isDisplaySendingLoader(user_id: string) {
        return this.isSendingMap.get(user_id)
    }

    isDisplayUpdatingLoader(user_id: string) {
        return this.isUpdatingMap.get(user_id)
    }

    closeAlreadyInTeamAlert() {
        this.inputNewMember.nativeElement.value = "";
        this.foundUser = null;
        this.isShowSelectToAdd = false;
        this.isAlreadyInTeam = false;
        this.cd.markForCheck();
    }

    addUser(newUser: User) {
        if (this.isUserInTeam(newUser)) {
            this.isAlreadyInTeam = true;
            this.cd.markForCheck();
            return;
        }
        this.isAlreadyInTeam = false;
        this.userFactory.upsert(newUser)
            .then((result: boolean) => {
                return result;
            })
            .then((result: boolean) => {
                if (result) {
                    this.team.members.push(newUser);
                    return this.team
                }
            })
            .then((newTeam: Team) => {
                return this.teamFactory.upsert(newTeam).then((result) => {
                    return newTeam;
                })
            })
            .then((team: Team) => {
                this.analytics.eventTrack("Team", { action: "add", team: team.name, teamId: team.team_id })
            })
            .then(() => {
                this.members$ = this.getAllMembers();
            })
            .then(() => {
                this.inputNewMember.nativeElement.value = "";
                this.inputEmail = "";
                this.isShowSelectToAdd = false;
                this.cd.markForCheck();
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

                return;
            }).then(() => {
                this.analytics.eventTrack("Team", { action: "invite", team: this.team.name, teamId: this.team.team_id })
                return;
            })
            .then(() => {
                this.intercom.trackEvent("Invite user", { team: this.team.name, teamId: this.team.team_id, email: user.email });
                return;
            })
        // })
    }

    resendUser(user: User): Promise<void> {
        return this.inviteUser(user).then(() => {
            this.resentMessage = `Invitation email successfully sent to ${user.email}.`;
        })
    }

    deleteMember(user: User) {
        if (this.team.members.length === 1) return;
        remove(this.team.members, function (m) { return m.user_id === user.user_id });
        this.cd.markForCheck();
        this.teamFactory.upsert(this.team).then(() => { this.members$ = this.getAllMembers(); })
    }

    createUser(email: string) {
        if (this.inviteForm.dirty && this.inviteForm.valid) {
            this.isCreatingUser = true;
            let firstname = this.inviteForm.controls["firstname"].value
            let lastname = this.inviteForm.controls["lastname"].value

            this.createUserFullDetails(email, firstname, lastname)
                .then(() => {
                    this.members$ = this.getAllMembers();
                })
                .then(() => {
                    this.isCreatingUser = false;
                    this.inputNewMember.nativeElement.value = "";
                    this.inputEmail = "";
                    this.isShowInviteForm = false;
                    this.inviteForm.reset();
                    this.cd.markForCheck()
                });
        }
    }

    createUserFullDetailsFake(email: string, firstname: string, lastname: string) {
        return new Promise((resolve) => setTimeout(resolve, 3000))
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
                })
            })
            .then(() => {
                this.analytics.eventTrack("Team", { action: "create", team: this.team.name, teamId: this.team.team_id });
                return true;
            })
            .then(() => {
                this.intercom.trackEvent("Create user", { team: this.team.name, teamId: this.team.team_id, email: email });
                return true;
            })
            .catch((reason) => {
                // console.log("catching ", reason)
                this.errorMessage = reason;
                throw Error(reason);
            })

    }


    onKeyUp(searchTextValue: string) {
        this.inputEmail$.next(searchTextValue)
    }

    trackByMemberId(index: number, member: User) {
        return member.user_id;
    }

    changeUserRole(user: User, userRole: UserRole) {
        this.isUpdatingMap.set(user.user_id, true)
        this.userService.updateUserRole(user.user_id, UserRole[userRole]).then(() => {
            this.isUpdatingMap.set(user.user_id, false);
            this.cd.markForCheck();
        })
    }
}
