import { Role } from "./../../shared/model/role.data";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { UserFactory } from "./../../shared/services/user.factory";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "./../../shared/services/team.factory";
import { Component, Input, ViewChild, OnChanges, SimpleChanges, EventEmitter, Output, ElementRef } from "@angular/core";
import { Initiative } from "../../shared/model/initiative.data"
import { Team } from "../../shared/model/team.data"
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../shared/model/user.data";
import { _catch } from "rxjs/operator/catch";
import { _do } from "rxjs/operator/do";
import { switchMap } from "rxjs/operator/switchMap";
import { of } from "rxjs/observable/of";
import { debounceTime } from "rxjs/operator/debounceTime";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { DataSet } from "../../shared/model/dataset.data";
import { compact, sortBy } from "lodash";
import { Helper } from "../../shared/model/helper.data";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2/dist";

@Component({
    selector: "initiative",
    templateUrl: "./initiative.component.html",
    styleUrls: ["./initiative.component.css"],
    providers: [Angulartics2Mixpanel, Angulartics2]
})

export class InitiativeComponent implements OnChanges {

    @Output() edited: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() node: Initiative;
    @Input() parent: Initiative;
    // @Input() isReadOnly: boolean;
    @Input() datasetId: string;

    public members$: Promise<User[]>;
    public dataset$: Promise<DataSet>
    public team$: Promise<Team>;

    isTeamMemberFound: boolean = true;
    isTeamMemberAdded: boolean = false;
    currentTeamName: string;
    searching: boolean;
    searchFailed: boolean;
    hideme: Array<boolean> = [];
    authorityHideMe: boolean;
    descriptionHideMe: boolean;
    cancelClicked: boolean;
    teamName: string;
    teamId: string;

    @ViewChild("inputDescription") public inputDescriptionElement: ElementRef;
    @ViewChild("inputRole") public inputRoleElement: ElementRef;
    @ViewChild("inputAuthorityRole") public inputAuthorityRole: ElementRef;

    constructor(private teamFactory: TeamFactory, private userFactory: UserFactory,
        private datasetFactory: DatasetFactory, private analytics: Angulartics2Mixpanel) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.node && changes.node.currentValue) {
            this.descriptionHideMe = changes.node.currentValue.description ? (changes.node.currentValue.description.trim() !== "") : false;
            if (changes.node.isFirstChange() || !(changes.node.previousValue) || changes.node.currentValue.team_id !== changes.node.previousValue.team_id) {

                this.team$ = this.teamFactory.get(changes.node.currentValue.team_id)
                    .then(t => { this.teamName = t.name; this.teamId = t.team_id; return t },
                    () => { return Promise.reject("No team available") }).catch(() => { }
                    )

                this.members$ = this.team$
                    .then((team: Team) => {
                        return this.userFactory.getUsers(team.members.map(m => m.user_id))
                            .then(members => compact(members))
                            .then(members => sortBy(members, m => m.name))
                    })
                    .catch(() => { })
            }

        }

        if (changes.datasetId && changes.datasetId.currentValue) {
            this.dataset$ = this.datasetFactory.get(<string>changes.datasetId.currentValue).then(d => d, () => { return Promise.reject("no dataset") })
        }
    }

    ngOnInit() {

    }

    onBlur() {
        // console.log("saving", this.node)
        this.saveDescription(this.inputDescriptionElement.nativeElement.value)
        this.edited.emit(true);
    }

    saveName(newName: any) {
        this.node.name = newName;
        this.analytics.eventTrack("Initiative", { action: "change name", team: this.teamName, teamId: this.teamId });
    }

    saveDescription(newDesc: string) {
        this.node.description = newDesc;
    }

    saveRole(helper: Helper, description: string) {
        // console.log(helper.name, description)
        if (helper.roles[0]) {
            helper.roles[0].description = description;
        }
        else {
            helper.roles[0] = new Role({ description: description })
        }
        this.analytics.eventTrack("Initiative", { action: "changing role", team: this.teamName, teamId: this.teamId });
    }

    toggleRole(i: number) {
        this.hideme.forEach(el => {
            el = true
        });
        this.hideme[i] = !this.hideme[i];
    }

    saveAccountable(newAccountable: NgbTypeaheadSelectItemEvent) {
        let accountable = newAccountable.item;
        accountable.roles = [];
        if (this.inputAuthorityRole) accountable.roles[0] = new Role({ description: this.inputAuthorityRole.nativeElement.value });
        this.node.accountable = accountable;
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "add authority", team: this.teamName, teamId: this.teamId });
    }

    saveHelper(newHelper: NgbTypeaheadSelectItemEvent) {
        if (this.node.helpers.findIndex(user => user.user_id === newHelper.item.user_id) < 0) {
            let helper = newHelper.item;
            helper.roles = [];
            this.node.helpers.unshift(helper);
        }
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "add helper", team: this.teamName, teamId: this.teamId });
    }

    removeHelper(helper: Helper) {
        let index = this.node.helpers.findIndex(user => user.user_id === helper.user_id);
        this.node.helpers.splice(index, 1);
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "remove helper", team: this.teamName, teamId: this.teamId });
    }

    filterMembers(term: string): Observable<User[]> {
        return term.length < 1
            ? Observable.from(this.members$.then(ms => this.node.accountable ? ms.filter(m => m.user_id !== this.node.accountable.user_id) : ms))
            : Observable.from(this.members$.then(ms => this.node.accountable ? ms.filter(m => m.user_id !== this.node.accountable.user_id) : ms)
                .then(members => members.filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email)).splice(0, 10))
                .catch())

    }

    removeAuthority() {
        this.node.accountable = undefined;
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "remove authority", team: this.teamName, teamId: this.teamId });
    }

    searchTeamMember = (text$: Observable<string>) =>
        _do.call(
            switchMap.call(
                _do.call(
                    distinctUntilChanged.call(
                        debounceTime.call(text$, 300)),
                    () => this.searching = true),
                (term: string) =>
                    _catch.call(
                        _do.call(
                            this.filterMembers(term)
                            , () => this.searchFailed = false),
                        () => {
                            this.searchFailed = true;
                            return of.call([]);
                        }
                    )
            ),
            () => this.searching = false);


    formatter = (result: User) => { return result.name };
}




