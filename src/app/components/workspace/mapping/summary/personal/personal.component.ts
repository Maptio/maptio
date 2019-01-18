import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { User } from "../../../../../shared/model/user.data";
// import { Tag, SelectableTag } from "../../../../../shared/model/tag.data";
import { Team } from "../../../../../shared/model/team.data";
import { Router } from "@angular/router";
// import { partition } from "lodash";


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

    constructor(private cd: ChangeDetectorRef, private router: Router) {

    }

    ngOnInit() {
        if (this._user && this._initiative && this._team) {
            this.getSummary();
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
        this.ngOnInit();
    }

    getSummary() {
        this.authorities = [];
        this.helps = [];

        this._initiative.traverse(function (i: Initiative) {
            if (i.accountable && i.accountable.user_id === this._user.user_id) {
                if (!this.authorities.includes(i)) this.authorities.push(i)
            }
            if (i.helpers && i.helpers.find(h => h.user_id === this._user.user_id && i.accountable && i.accountable.user_id !== h.user_id)) {
                if (!this.helps.includes(i)) this.helps.push(i)
            }

        }.bind(this));
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

    onSelectMember(user:User){
        this.selectMember.emit(user);
    }
}