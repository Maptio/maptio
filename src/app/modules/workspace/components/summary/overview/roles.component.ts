import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
// import { Observable, Subscription, Subject } from "rxjs";

// import { Angulartics2Mixpanel } from "angulartics2/mixpanel";

import { DataService } from "../../../services/data.service";
import { RoleLibraryService } from "../../../services/role-library.service";
import { PermissionsService } from "../../../../../shared/services/permissions/permissions.service";
import { Role } from "../../../../../shared/model/role.data";
// import { UserFactory } from "../../../../../core/http/user/user.factory";
// import { UserService } from "../../../../../shared/services/user/user.service";
import { DataSet } from "../../../../../shared/model/dataset.data";
import { Team } from "../../../../../shared/model/team.data";
import { User } from "../../../../../shared/model/user.data";
// import { Permissions } from "../../../../../shared/model/permission.data";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { LoaderService } from "../../../../../shared/components/loading/loader.service";


@Component({
    selector: "summary-roles",
    templateUrl: "./roles.component.html",
    styleUrls: ["./roles.component.css"],
    host: { "class": "d-flex flex-column w-100" },
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class RolesSummaryComponent implements OnInit {
    @Output() changeTab: EventEmitter<string> = new EventEmitter<string>();
    @Output() selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();
    // @Output() userDataset: EventEmitter<DataSet> = new EventEmitter<DataSet>();
    // @Output() rootInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();

    // members: User[];
    // filteredMembers: User[];
    initiative: Initiative;
    team: Team;
    dataset: DataSet;
    datasetId: string;
    // selectedMember: User;
    dataSubscription: Subscription;
    // filterMembers$: Subject<string> = new Subject<string>();
    // isOthersPeopleVisible: boolean;
    // Permissions = Permissions;

    roles: Role[] = [];
    initiativesWithRole: Map<Role, Initiative[]>;
    isDescriptionVisible: Map<Role, boolean>;

    // @Input("helper") helper: Helper;
    // @Input("team") team: Team;
    // @Input("summaryUrlRoot") summaryUrlRoot: string;
    // @Input("isAuthority") isAuthority: boolean;
    // @Input("isUnauthorized") isUnauthorized: boolean;

    // @Output("remove") remove: EventEmitter<Helper> = new EventEmitter<Helper>();
    // @Output("save") save: EventEmitter<void> = new EventEmitter<void>();

    // cancelClicked: boolean;
    // isPickRoleMode = false;
    isCreateRoleMode = false;
    isEditRoleMode = false;

    newRole: Role;
    roleBeingEdited: Role;


    constructor(
        private roleLibrary: RoleLibraryService,
        private router: Router,
        public route: ActivatedRoute,
        // public userFactory: UserFactory,
        // private userService: UserService,
        private dataService: DataService,
        public loaderService: LoaderService,
        private permissionsService: PermissionsService,
        private cd: ChangeDetectorRef,
        // private analytics: Angulartics2Mixpanel, 
    ) {}

    ngOnInit(): void {
        this.loaderService.show();

        this.roles = this.roleLibrary.getRoles();
        this.roles = this.sortRoles(this.roles);

        this.dataSubscription = this.dataService
            .get()
            .subscribe((data: any) => {
                this.initiative = data.initiative;
                this.dataset = data.dataset;
                this.datasetId = this.dataset.shortid;
                this.team = data.team;

                this.getListOfInitiativesForEachRole();

                this.isDescriptionVisible = new Map(
                    this.roles.map((role) => {
                        // Make sure previous values are saved even if we change something that will
                        // trigger this code to run
                        const isOpen = this.isDescriptionVisible && this.isDescriptionVisible.has(role)
                            ? this.isDescriptionVisible.has(role)
                            : false
                        return [role, isOpen]
                    })
                );

                this.loaderService.hide();
                this.cd.markForCheck();
            });
    }

    ngOnDestroy(): void {
        if (this.dataSubscription) this.dataSubscription.unsubscribe();
    }

    getListOfInitiativesForEachRole() {
        this.initiativesWithRole = new Map(
            this.roles.map((role) => [role, []])
        );

        this.initiative.traverse(function (initiative: Initiative) {
            const people = initiative.accountable
                ? initiative.helpers.concat([initiative.accountable])
                : initiative.helpers;
            people.forEach((helper) => {
                if (helper && helper.roles) {
                    helper.roles.forEach((helperRole) => {
                        if (this.roleLibrary.findRoleInList(helperRole, this.roles)) {
                            const libraryRole = this.roleLibrary.findRoleInLibrary(helperRole);
                            if (!this.getInitiativesFor(libraryRole).includes(initiative)) {
                                this.initiativesWithRole.set(
                                    libraryRole,
                                    this.initiativesWithRole.get(libraryRole).concat([initiative])
                                )
                            }
                        }
                    })
                }
            });
        }.bind(this))
    }

    getInitiativesFor(role: Role): Initiative[] {
        if (this.initiativesWithRole && this.initiativesWithRole.has(role)) {
            return this.initiativesWithRole.get(role);
        } else {
            return [];
        }
    }
    
    hasInitiatives(role: Role): boolean {
        const initiativesList = this.getInitiativesFor(role);
        return initiativesList && initiativesList.length ? true : false;
    }

    areDetailsVisible(role: Role): boolean {
        return this.isDescriptionVisible && this.isDescriptionVisible.has(role)
            ? this.isDescriptionVisible.get(role)
            : false;
    }

    onCreateRole() {
        this.newRole = new Role();
        this.isCreateRoleMode = true;
        this.cd.markForCheck();
    }

    onCancelCreatingNewRole() {
        this.isCreateRoleMode = false;
        this.newRole = undefined;
        this.cd.markForCheck();
    }

    onSaveNewRole() {
        this.roles = this.sortRoles(this.roles);
        this.isCreateRoleMode = false;
        this.newRole = undefined;
        this.cd.markForCheck();
    }

    onEditRole(role: Role) {
        if (this.isDescriptionVisible.get(role)) {
            this.onToggleDetails(role);
        }
        this.roleBeingEdited = role;
        this.isEditRoleMode = true;
    }

    onToggleDetails(role: Role) {
        const isOpen = this.isDescriptionVisible.get(role);
        this.isDescriptionVisible.set(role, !isOpen)
    }

    onCancelEditingRole() {
        this.roleBeingEdited = undefined;
        this.isEditRoleMode = false;
    }

    onChangeRole() {
        this.roles = this.sortRoles(this.roles);
        this.onCancelEditingRole();
        this.cd.markForCheck();
    }

    onDeleteRole(roleToBeDeleted: Role) {
        this.roleLibrary.deleteRoleFromLibrary(roleToBeDeleted);
        this.cd.markForCheck();
    }

    onSelectMember(user: User) {
        this.cd.markForCheck();
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { member: user.shortid }
        });
        this.changeTab.emit('people');
    }

    onSelectInitiative(initiative: Initiative){
        this.selectInitiative.emit(initiative);
    }

    canEditLibraryRoles() {
        return this.permissionsService.canEditLibraryRoles();
    }

    sortRoles(roles: Role[]): Role[] {
        return roles.sort((a, b) => {
            // Sort the remaining roles by title
            if (a.hasTitle() && b.hasTitle()) {
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();

                if (aTitle > bTitle) {
                    return 1;
                }

                if (aTitle < bTitle) {
                    return -1;
                }
            }

            return 0;
        });
    }

    // ngOnInit(): void {
    //     this.loaderService.show();
    //     this.dataSubscription = this.dataService
    //         .get()
    //         .combineLatest(this.route.queryParams)
    //         .switchMap((data: [any, Params]) => {
    //             console.log(data)
    //             if (data[1].member) {
    //                 return this.userFactory.get(data[1].member)
    //                     .then(user => this.userService.getUsersInfo([user]))
    //                     .then((users: User[]) => {
    //                         console.log(users)
    //                         this.selectedMember = users[0];
    //                         this.cd.markForCheck();
    //                         return data[0];
    //                     });
    //             } else {
    //                 this.selectedMember = null;
    //                 this.cd.markForCheck();
    //                 return Observable.of(data[0])
    //             }
    //         })
    //         .subscribe((data: any) => {
    //             this.members = data.members;
    //             console.log(this.members)
    //             this.initiative = data.initiative;
    //             this.dataset = data.dataset;
    //             this.team = data.team;
    //             this.loaderService.hide();
    //             this.analytics.eventTrack("Map", {
    //                 action: "viewing",
    //                 view: "summary",
    //                 team: (<Team>data.team).name,
    //                 teamId: (<Team>data.team).team_id
    //             });
    //             this.filteredMembers = [].concat(this.members);
    //             this.cd.markForCheck();
    //         });

    //     this.filterMembers$.asObservable().debounceTime(250).subscribe((search) => {
    //         this.filteredMembers = (search === '')
    //             ? [].concat(this.members)
    //             : this.members.filter(m => m.name.toLowerCase().indexOf(search.toLowerCase()) >= 0);
    //         this.cd.markForCheck();
    //     })
    // }

    // ngOnDestroy(): void {
    //     if (this.dataSubscription) this.dataSubscription.unsubscribe();
    // }

    // onKeyDown(search: string) {
    //     this.filterMembers$.next(search);
    // }

    // onAddingNewMember(){
    //     this.router.navigateByUrl(`/teams/${this.team.team_id}/people`)
    // }

    // onSelectMember(user: User) {
    //     this.selectedMember = user;
    //     this.cd.markForCheck();
    //     this.router.navigate([], {
    //         relativeTo: this.route,
    //         queryParams: { member: user.shortid }
    //     })
    // }
}
