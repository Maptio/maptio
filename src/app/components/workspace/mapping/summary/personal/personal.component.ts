import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { User } from "../../../../../shared/model/user.data";
// import { Tag, SelectableTag } from "../../../../../shared/model/tag.data";
import { Team } from "../../../../../shared/model/team.data";
import { Router } from "@angular/router";
import { sortBy } from "lodash";


@Component({
    selector: "summary-personal",
    templateUrl: "./personal.component.html",
    styleUrls: ["./personal.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PersonalSummaryComponent implements OnInit {

    authorities: Array<Initiative> = [];
    helps: Array<Initiative> = [];
    public isLoading: boolean;
    authoritiesHideme: Array<boolean> = [];
    helpingHideme: Array<boolean> = [];
    initiativesMap: Map<number, boolean> = new Map<number, boolean>();
    columnNumber: number;

    @Input("member") public member: User;
    @Input("initiative") public initiative: Initiative;
    @Input("team") public team: Team;
    @Input("height") public height: number;
    @Input("datasetId") public datasetId: string;
    @Output() edit: EventEmitter<Initiative> = new EventEmitter<Initiative>();
    @Output() selectMember: EventEmitter<User> = new EventEmitter<User>();

    private _user: User;
    private _initiative: Initiative;
    private _team: Team;

    authorityName: string;
    helperName: string;

    constructor(private cd: ChangeDetectorRef, private router: Router) {

    }

    ngOnInit() {
        if (this._user && this._initiative && this._team) {
            this.getSummary();
            this.authorityName = this._team.settings.authority;
            this.helperName = this._team.settings.helper;
            this.cd.markForCheck();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.member && changes.member.currentValue) {
            this._user = changes.member.currentValue;
        }
        if (changes.initiative && changes.initiative.currentValue) {
            this._initiative = changes.initiative.currentValue;
        }
        if (changes.team && changes.team.currentValue) {
            this._team = changes.team.currentValue;
        }
        if (changes.datasetId && changes.datasetId.currentValue) {
            this.columnNumber = (localStorage.getItem(`map_settings_${changes.datasetId.currentValue}`)
                ? JSON.parse(localStorage.getItem(`map_settings_${changes.datasetId.currentValue}`)).directoryColumnsNumber
                : 1
            ) || 1;
            this.cd.markForCheck();
        }
        this.ngOnInit();
    }

    getSummary() {
        let authorities: Initiative[] = [];
        let helps: Initiative[] = [];

        this._initiative.traverse(function (i: Initiative) {
            if (i.accountable && i.accountable.user_id === this._user.user_id) {
                if (!authorities.includes(i)) authorities.push(i)
            }
            if (i.helpers && i.helpers.find(h => h.user_id === this._user.user_id && i.accountable && i.accountable.user_id !== h.user_id)) {
                if (!helps.includes(i)) helps.push(i)
            }

        }.bind(this));

        this.authorities = sortBy(authorities, i => i.name);
        this.helps = sortBy(helps, i => i.name)
    }


    // openInitiative(node: Initiative) {
    //     this.router.navigateByUrl(`/map/${this.datasetId}/${this.initiative.getSlug()}/circles?id=${node.id}`)
    // }

    toggleAuthorityView(i: number) {
        this.authoritiesHideme.forEach(el => {
            el = true
        });
        this.authoritiesHideme[i] = !this.authoritiesHideme[i];
    }

    toggleHelpingView(i: number) {
        this.helpingHideme.forEach(el => {
            el = true
        });
        this.helpingHideme[i] = !this.helpingHideme[i];
    }

    ngOnDestroy() {
    }

    onSelectMember(user: User) {
        this.selectMember.emit(user);
    }

    isColumnToggleActive(columns: number) {
        return this.columnNumber == columns;
    }

    setColumnNumber(columns: number) {
        this.columnNumber = columns;
        let settings = JSON.parse(localStorage.getItem(`map_settings_${this.datasetId}`));
        settings.directoryColumnsNumber = columns;
        localStorage.setItem(`map_settings_${this.datasetId}`, JSON.stringify(settings));

        this.cd.markForCheck();
    }
}