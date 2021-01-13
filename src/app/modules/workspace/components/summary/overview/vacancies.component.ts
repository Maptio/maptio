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

import { DataService } from "../../../services/data.service";
import { RoleLibraryService } from "../../../services/role-library.service";
import { PermissionsService } from "../../../../../shared/services/permissions/permissions.service";
import { Role } from "../../../../../shared/model/role.data";
import { DataSet } from "../../../../../shared/model/dataset.data";
import { Team } from "../../../../../shared/model/team.data";
import { User } from "../../../../../shared/model/user.data";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { LoaderService } from "../../../../../shared/components/loading/loader.service";


@Component({
    selector: "summary-vacancies",
    templateUrl: "./vacancies.component.html",
    styleUrls: ["./vacancies.component.css"],
    host: { "class": "d-flex flex-column w-100" },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacanciesSummaryComponent implements OnInit {
    @Output() changeTab: EventEmitter<string> = new EventEmitter<string>();
    @Output() selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();

    initiative: Initiative;
    team: Team;
    dataset: DataSet;
    datasetId: string;
    dataSubscription: Subscription;

    roles: Role[] = [];
    initiativesWithRole: Map<Role, Initiative[]>;
    isDescriptionVisible: Map<Role, boolean>;


    constructor(
        private roleLibrary: RoleLibraryService,
        private router: Router,
        public route: ActivatedRoute,
        private dataService: DataService,
        public loaderService: LoaderService,
        private cd: ChangeDetectorRef,
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

                if (!this.isDescriptionVisible) {
                    this.isDescriptionVisible = new Map();
                }
                this.roles.forEach((role) => () => {
                    // Make sure previous values are saved even if we change something that will
                    // trigger this code to run
                    const isOpen = this.isDescriptionVisible && this.isDescriptionVisible.has(role)
                        ? this.isDescriptionVisible.get(role)
                        : false
                    this.isDescriptionVisible.set(role, isOpen); 
                });

                this.loaderService.hide();
                this.cd.markForCheck();
            });
    }

    ngOnDestroy(): void {
        if (this.dataSubscription) this.dataSubscription.unsubscribe();
    }

    getListOfInitiativesForEachRole() {
        this.initiativesWithRole = new Map();
        this.roles.forEach((role) => {
            this.initiativesWithRole.set(role, []);
        });

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

    onToggleDetails(role: Role) {
        const isOpen = this.isDescriptionVisible.get(role);
        this.isDescriptionVisible.set(role, !isOpen)
    }

    onSelectInitiative(initiative: Initiative){
        this.selectInitiative.emit(initiative);
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
}
