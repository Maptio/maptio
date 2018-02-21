import { Validators } from "@angular/forms";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { UserFactory } from "./../../shared/services/user.factory";
import { Observable, Subscription } from "rxjs/Rx";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { TeamFactory } from "./../../shared/services/team.factory";
import { ActivatedRoute, Params } from "@angular/router";
import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Team } from "../../shared/model/team.data";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { DataSet } from "../../shared/model/dataset.data";
import { compact, sortBy, differenceBy, remove, uniqBy } from "lodash"
import { UserService } from "../../shared/services/user/user.service";
import { Angulartics2Mixpanel } from "angulartics2";
import { FileUploader, FileUploaderOptions, FileLikeObject, ParsedResponseHeaders } from "ng2-file-upload";
import { Constants, FileService } from "../../shared/services/file/file.service";
import * as _ from "lodash";

@Component({
    selector: "team",
    templateUrl: "./team.component.html",
    styleUrls: ["./team.component.css"]
})
export class TeamComponent implements OnInit {

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
    public resentMessage: string;

    public inviteForm: FormGroup;
    public teamSettingsForm: FormGroup;
    public teamName: string;
    public teamAuthority: string;
    public teamHelper: string;
    public team: Team;

    public createdUser: User;
    @ViewChild("fileImportInput") fileImportInput: any;

    csvRecords: any[] = [];

    isSendingMap: Map<string, boolean> = new Map<string, boolean>();

    currentImportedUserIndex: number;
    importUserLength: number;
    progress: number;
    importedSuccessfully: number;
    importedFailed: number;
    totalRecordsToImport: number;
    isImportFinished: boolean;
    isParsingFinished: boolean;
    isFileInvalid: boolean;

    private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    constructor(public auth: Auth, private userService: UserService, private route: ActivatedRoute,
        private teamFactory: TeamFactory, private userFactory: UserFactory,
        private datasetFactory: DatasetFactory, private analytics: Angulartics2Mixpanel,
        private fileService: FileService, private cd: ChangeDetectorRef) {

        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            if (!params["teamid"]) return
            this.teamId = params["teamid"]
            this.team$ = this.teamFactory.get(this.teamId);

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
        this.teamSettingsForm = new FormGroup({
            "name": new FormControl(this.teamName, [
                Validators.required,
                Validators.minLength(2)
            ]),
            "authority": new FormControl(this.teamAuthority),
            "helper": new FormControl(this.teamHelper),
        })

        this.team$.then(team => {
            this.teamName = team.name;
            this.teamAuthority = team.settings.authority;
            this.teamHelper = team.settings.helper;
            this.team = team;

        })



    }

    ngOnInit() {
        this.members$ = this.getAllMembers();
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
        });
    }

    isDisplayLoader(user_id: string) {
        return this.isSendingMap.get(user_id)
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
        return this.team$.then((team: Team) => {
            return this.userService.sendInvite(user.email, user.user_id, user.firstname, user.lastname, user.name, team.name, this.user.name)
                .then((isSent) => {
                    user.isInvitationSent = isSent;
                    this.isSendingMap.set(user.user_id, false);
                    this.cd.markForCheck();
                    this.analytics.eventTrack("Team", { action: "invite", team: team.name, teamId: team.team_id })
                    return;
                }
                )
        })
    }

    resendUser(user: User): Promise<void> {
        return this.inviteUser(user).then(() => {
            this.resentMessage = `Invitation email successfully sent to ${user.email}.`;
        })
    }

    deleteMember(user: User) {
        // console.log("deleting", user.email)
        this.team$.then((team: Team) => {
            remove(team.members, function (m) { return m.user_id === user.user_id })
            this.teamFactory.upsert(team).then(() => { this.members$ = this.getAllMembers(); })
        })

    }

    createUser(email: string) {
        if (this.inviteForm.dirty && this.inviteForm.valid) {

            let firstname = this.inviteForm.controls["firstname"].value
            let lastname = this.inviteForm.controls["lastname"].value

            this.createUserFullDetails(email, firstname, lastname);
        }
    }

    createUserFullDetails(email: string, firstname: string, lastname: string) {
        return this.team$.then((team: Team) => {

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
                    team.members.push(user);
                    this.teamFactory.upsert(team).then((result) => {
                        this.newMember = undefined;
                        this.searchFailed = false;
                    })
                })
                .then(() => {
                    this.members$ = this.getAllMembers();
                })
                .then(() => {
                    this.analytics.eventTrack("Team", { action: "create", team: team.name, teamId: team.team_id });
                    return true;
                })
                .catch((reason) => {
                    // console.log("catching ", reason)
                    this.errorMessage = reason;
                    throw Error(reason);
                })
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


    fileChangeListener($event: any): void {
        this.isParsingFinished = false;
        this.isFileInvalid = false;
        this.importedSuccessfully = 0;
        this.importedFailed = 0;
        this.csvRecords = [];
        let text = [];
        let files = $event.srcElement.files;

        if (Constants.validateHeaderAndRecordLengthFlag) {
            if (!this.fileService.isCSVFile(files[0])) {
                this.isFileInvalid = true;
                this.fileReset();
            }
        }

        let input = $event.target;
        let reader = new FileReader();
        reader.readAsText(input.files[0], "utf-8");

        reader.onload = (data) => {
            let csvData = reader.result;
            let csvRecordsArray = csvData.split(/\r\n|\n|\r/);
            let headerLength = -1;
            if (Constants.isHeaderPresentFlag) {
                let headersRow = this.fileService.getHeaderArray(csvRecordsArray, Constants.tokenDelimeter);
                headerLength = headersRow.length;
                let isHeaderValid = this.fileService.validateHeaders(headersRow, ["First name", "Last name", "Email"]);
                if (!isHeaderValid) {
                    this.isFileInvalid = true;
                }
            }

            try {
                this.csvRecords = this.fileService.getDataRecordsArrayFromCSVFile(csvRecordsArray,
                    headerLength, Constants.validateHeaderAndRecordLengthFlag, Constants.tokenDelimeter);
                this.totalRecordsToImport = this.csvRecords.length - 1; // remove header
                if (this.csvRecords == null) {
                    // If control reached here it means csv file contains error, reset file.
                    this.fileReset();
                }

            }
            catch (error) {

                // console.log(error)
                this.isFileInvalid = true;
            }
            finally {
                this.cd.markForCheck();
            }
            this.isParsingFinished = true;
        }

        reader.onerror = function () {
            // alert("Unable to read " + input.files[0]);
            this.isFileInvalid = true;
        }.bind(this);
    };

    fileReset() {
        this.isFileInvalid = false;
        this.importedSuccessfully = 0;
        this.importedFailed = 0;
        this.isImportFinished = false;
        this.fileImportInput.nativeElement.value = "";
        this.csvRecords = [];
    }

    importUsers() {
        this.isImportFinished = false;
        this.importedSuccessfully = 0;
        this.importedFailed = 0;

        _(this.csvRecords).drop(1).forEach((record, index, all) => {
            record[3] = "";
            record[4] = false; // has finished processed
            // this.fakeCreate((<String>record[2]).trim(), (<String>record[0]).trim(), (<String>record[1]).trim())
            //     .delay(1000)
            //     .toPromise()
            this.createUserFullDetails((<String>record[2]).trim(), (<String>record[0]).trim(), (<String>record[1]).trim())
                .then(result => {
                    this.importedSuccessfully += 1;
                    record[3] = "Imported";
                    record[4] = true;
                }, (error: any) => {
                    this.importedFailed += 1;
                    record[3] = error.message;
                    record[4] = true;
                });
        });
        this.isImportFinished = true;
    }


    isTeamSettingSaved: boolean;
    isTeamSettingFailed: boolean;
    saveTeamSettings() {
        this.isTeamSettingSaved = false;
        this.isTeamSettingFailed = false;
        if (this.teamSettingsForm.valid && this.teamSettingsForm.dirty) {
            let updatedTeam = new Team({
                team_id: this.teamId,
                name: this.teamName,
                members: this.team.members,
                settings: { authority: this.teamAuthority, helper: this.teamHelper }
            });

            this.teamFactory.upsert(updatedTeam)
                .then((isUpdated: boolean) => {
                    this.isTeamSettingSaved = isUpdated;
                    this.cd.markForCheck();
                })
                .catch(err => { this.isTeamSettingFailed = true; this.cd.markForCheck(); })
        }
    }
    // fakeCreate(firstname: string, lastname: string, email: string) {
    //     return Observable.if(
    //         () => { return Math.random() < 0.9 },
    //         Observable.of(true),
    //         Observable.throw({ message: "Something bad happened" }));

    // }

}

