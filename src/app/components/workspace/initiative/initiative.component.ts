import { environment } from "./../../../../environment/environment";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { Permissions } from "./../../../shared/model/permission.data";
import { Role } from "./../../../shared/model/role.data";
import { Helper } from "./../../../shared/model/helper.data";
import { DatasetFactory } from "./../../../shared/services/dataset.factory";
import { UserFactory } from "./../../../shared/services/user.factory";
import { TeamFactory } from "./../../../shared/services/team.factory";
import { Team } from "./../../../shared/model/team.data";
import { DataSet } from "./../../../shared/model/dataset.data";
import { User } from "./../../../shared/model/user.data";
import { Tag } from "./../../../shared/model/tag.data";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Observable, Subject } from "rxjs/Rx";
import { Component, Input, ViewChild, OnChanges, SimpleChanges, EventEmitter, Output, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, TemplateRef, Renderer2 } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import { NgbTypeaheadSelectItemEvent, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { _catch } from "rxjs/operator/catch";
import { _do } from "rxjs/operator/do";
import { switchMap } from "rxjs/operator/switchMap";
import { of } from "rxjs/observable/of";
import { debounceTime } from "rxjs/operator/debounceTime";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { compact, sortBy } from "lodash";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2/dist";
import { remove } from "lodash"
import { UserService } from "../../../shared/services/user/user.service";

@Component({
    selector: "initiative",
    templateUrl: "./initiative.component.html",
    styleUrls: ["./initiative.component.css"],
    providers: [Angulartics2Mixpanel, Angulartics2],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class InitiativeComponent implements OnChanges {

    @Output() edited: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output("editTags") editTags:EventEmitter<any> = new EventEmitter<any>();

    @Input() node: Initiative;
    // @Input() parent: Initiative;
    @Input() datasetTags: Array<Tag>;
    // @Input() isReadOnly: boolean;
    @Input() datasetId: string;
    @Input() team: Team;

    public members$: Promise<User[]>;
    public dataset$: Promise<DataSet>
    public team$: Promise<Team>;
    public authority: string;
    public helper: string;
    public user: User;

    isTeamMemberFound: boolean = true;
    isTeamMemberAdded: boolean = false;
    isRestrictedAddHelper: boolean;
    currentTeamName: string;
    searching: boolean;
    searchFailed: boolean;
    hideme: Array<boolean> = [];
    authorityHideMe: boolean;
    descriptionHideMe: boolean;
    cancelClicked: boolean;
    teamName: string;
    teamId: string;
    Permissions = Permissions;

    @ViewChild("inputDescription") public inputDescriptionElement: ElementRef;
    @ViewChild("inputRole") public inputRoleElement: ElementRef;
    @ViewChild("inputAuthorityRole") public inputAuthorityRole: ElementRef;
    @ViewChild("inputAuthority") public inputAuthority: ElementRef;
    @ViewChild("inputTag") public inputTag:NgbTypeahead;

    focus$ = new Subject<string>();
    click$ = new Subject<string>();
    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
    MESSAGE_PERMISSIONS_DENIED_EDIT = environment.MESSAGE_PERMISSIONS_DENIED_EDIT;

    constructor(private auth: Auth, private teamFactory: TeamFactory, private userFactory: UserFactory,
        private userService:UserService, 
        private datasetFactory: DatasetFactory, private analytics: Angulartics2Mixpanel,
        private cd: ChangeDetectorRef, private renderer: Renderer2) {
    }

    public disableFieldset = (templateRef: TemplateRef<any>) => {
        this.renderer.setAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled", "");
    }
    public enableFieldset = (templateRef: TemplateRef<any>) => {
        // this.renderer.removeAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled");
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.node && changes.node.currentValue) {
            this.descriptionHideMe = changes.node.currentValue.description ? (changes.node.currentValue.description.trim() !== "") : false;
            this.isRestrictedAddHelper = false;
            if (changes.node.isFirstChange() || !(changes.node.previousValue) || changes.node.currentValue.team_id !== changes.node.previousValue.team_id) {

                this.team$ = this.teamFactory.get(<string>changes.node.currentValue.team_id)
                    .then(t => { this.teamName = t.name; this.teamId = t.team_id; return t },
                    () => { return Promise.reject("No organisation available") })
                // .catch(() => { })


                this.members$ = this.team$
                    .then((team: Team) => {
                        return this.userService.getUsersInfo(team.members)
                            .then(members => compact(members))
                            .then(members => sortBy(members, m => m.name))
                    })
                // .catch(() => { })
            }

        }

        if (changes.datasetId && changes.datasetId.currentValue) {
            this.dataset$ = this.datasetFactory.get(<string>changes.datasetId.currentValue).then(d => d, () => { return Promise.reject("no dataset") })
        }

        if (changes.team && changes.team.currentValue) {
            this.authority = changes.team.currentValue.settings.authority;
            this.helper = changes.team.currentValue.settings.helper;
        }

        this.cd.markForCheck();

    }

    ngOnInit() {
        this.auth.getUser().subscribe(user => this.user = user)
    }

    onBlur() {
        // this.saveDescription(this.inputDescriptionElement.nativeElement.value);
        if(!this.node.accountable){
            (<HTMLInputElement>this.inputAuthority.nativeElement).value ="";
        }else{
            (<HTMLInputElement>this.inputAuthority.nativeElement).value =this.node.accountable.name;
        }
        // this.inputTag.writeValue("");
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
        if (helper.roles[0]) {
            helper.roles[0].description = description;
        }
        else {
            helper.roles[0] = new Role({ description: description })
        }
        this.analytics.eventTrack("Initiative", { action: "changing role", team: this.teamName, teamId: this.teamId });
    }

    savePrivilege(helper: Helper, hasAuthorityPrivileges: boolean) {
        helper.hasAuthorityPrivileges = hasAuthorityPrivileges;
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "changing helper privilege", team: this.teamName, teamId: this.teamId });
    }

    toggleRole(i: number) {
        this.hideme.forEach(el => {
            el = true
        });
        this.hideme[i] = !this.hideme[i];
    }

    getAllHelpers() {
        return remove([...this.node.helpers, this.node.accountable].reverse()); // always disaply the authority first
    }

    trackByUserId(index: number, user: User) {
        return user.user_id;
    }

    isAuthority(helper: Helper) {
        return this.node.accountable && this.node.accountable.user_id === helper.user_id
    }

    saveAccountable(newAccountable: NgbTypeaheadSelectItemEvent) {
        let accountable = newAccountable.item;
        accountable.roles = [];

        this.node.accountable = accountable;
        if (this.node.helpers.map(h => h.user_id).includes(accountable.user_id)) {
            let helper = this.node.helpers.filter(h => h.hasAuthorityPrivileges)[0]
            let roles = helper.roles;
            this.removeHelper(helper);
            this.node.accountable.roles = roles;
        }
        this.onBlur();
        this.getAllHelpers();
        this.cd.markForCheck();
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

    saveHelperRestricted(newHelper: NgbTypeaheadSelectItemEvent) {
        if (newHelper.item.user_id === this.user.user_id) {
            this.saveHelper({ item: this.user, preventDefault: null })
        } else {
            this.isRestrictedAddHelper = true;
        }
        // if (this.node.helpers.findIndex(user => user.user_id === newHelper.item.user_id) < 0) {
        //     let helper = newHelper.item;
        //     helper.roles = [];
        //     this.node.helpers.unshift(helper);
        // }
        // this.onBlur();
        // this.analytics.eventTrack("Initiative", { action: "add helper", team: this.teamName, teamId: this.teamId });
    }

    saveTag(newTag: Tag) {
        if (this.node.tags.findIndex(t => t.shortid === newTag.shortid) < 0) {
            this.node.tags.unshift(new Tag(newTag));
        }
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "add tag", team: this.teamName, teamId: this.teamId });
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

    filterTags(term: string): Observable<Tag[]> {
        return term === "" || term.length < 1
            ? Observable.of(this.datasetTags)
            : Observable.of(this.datasetTags.filter(v => new RegExp(term, "gi").test(v.name)).splice(0, 10))

    }

    removeAuthority() {
        this.node.accountable = undefined;
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "remove authority", team: this.teamName, teamId: this.teamId });
    }

    removeTag(tag: Tag) {
        let index = this.node.tags.findIndex(t => t.shortid === tag.shortid);
        this.node.tags.splice(index, 1);
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "remove tag", team: this.teamName, teamId: this.teamId });
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

    openEditTags(){
        this.editTags.emit();
    }
}




