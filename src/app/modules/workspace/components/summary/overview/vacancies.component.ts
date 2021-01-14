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
import { MarkdownUtilsService } from "../../../../../shared/services/markdown/markdown-utils.service";


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

    vacancies: Role[] = [];
    initiativesWithVacancy: Map<Role, Initiative[]>;
    isDescriptionVisible: Map<Role, boolean>;


    constructor(
        private roleLibrary: RoleLibraryService,
        private router: Router,
        public route: ActivatedRoute,
        private dataService: DataService,
        public loaderService: LoaderService,
        private markdownUtilsService: MarkdownUtilsService,
        private cd: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.loaderService.show();

        this.dataSubscription = this.dataService
            .get()
            .subscribe((data: any) => {
                this.initiative = data.initiative;
                this.dataset = data.dataset;
                this.datasetId = this.dataset.shortid;
                this.team = data.team;

                this.getVacanciesFromInitiatives();

                this.vacancies = this.sortRoles(this.vacancies);

                if (!this.isDescriptionVisible) {
                    this.isDescriptionVisible = new Map();
                }
                this.vacancies.forEach((role) => () => {
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

    getVacanciesFromInitiatives() {
        this.vacancies = [];
        this.initiativesWithVacancy = new Map();

        this.initiative.traverse(function (initiative: Initiative) {
            initiative.vacancies.forEach((vacancy) => {
                const matchingVacancy = this.roleLibrary.findRoleInList(vacancy, this.vacancies);

                if (matchingVacancy && !this.initiativesWithVacancy.has(matchingVacancy)) {
                    console.error(
                        `Found vacancy (${matchingVacancy.title}) on internal list of vacancies, but ` +
                        `there are no initatives associated with it yet.`
                    );
                }

                if (!matchingVacancy) {
                    // Vacancy from initiative isn't yet in our list of vacancies, let's add it there
                    this.vacancies.push(vacancy);
                    this.initiativesWithVacancy.set(vacancy, [initiative]);
                    return;
                } else if (!this.initiativesWithVacancy.get(matchingVacancy).includes(initiative)) {
                    // Vacancy is on our list already, but initiative isn't on list of initiatives associated with the
                    // vacancy, so let's add it there
                    this.initiativesWithVacancy.set(
                        matchingVacancy,
                        this.initiativesWithVacancy.get(matchingVacancy).concat([initiative])
                    );
                }

                // If we get here, the vacancy was on our list already (first if statement) and the initiative was
                // already associated with the vacancy too (second if statement), our work here is done
            });
        }.bind(this));
    }

    getInitiativesFor(role: Role): Initiative[] {
        if (this.initiativesWithVacancy && this.initiativesWithVacancy.has(role)) {
            return this.initiativesWithVacancy.get(role);
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
            const aTitle = this.getDisplayTitle(a).toLowerCase();
            const bTitle = this.getDisplayTitle(b).toLowerCase();

            if (aTitle > bTitle) {
                return 1;
            }

            if (aTitle < bTitle) {
                return -1;
            }

            return 0;
        });
    }

    getDisplayTitle(role: Role): string {
        return role.hasTitle()
            ? role.title.toLowerCase()
            : this.markdownUtilsService.convertToPlainText(role.description);
    }
}
