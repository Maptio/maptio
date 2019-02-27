import { environment } from "../../../../../config/environment";
import { Auth } from "../../../../../core/authentication/auth.service";
import { Permissions } from "../../../../../shared/model/permission.data";
import { Role } from "../../../../../shared/model/role.data";
import { Helper } from "../../../../../shared/model/helper.data";
import { DatasetFactory } from "../../../../../core/http/map/dataset.factory";
import { UserFactory } from "../../../../../core/http/user/user.factory";
import { TeamFactory } from "../../../../../core/http/team/team.factory";
import { Team } from "../../../../../shared/model/team.data";
import { DataSet } from "../../../../../shared/model/dataset.data";
import { User } from "../../../../../shared/model/user.data";
import { Tag } from "../../../../../shared/model/tag.data";
import { Initiative } from "../../../../../shared/model/initiative.data";
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
import { compact, sortBy, remove } from "lodash-es";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { UserService } from "../../../../../shared/services/user/user.service";

@Component({
    selector: "initiative",
    templateUrl: "./initiative.component.html",
    styleUrls: ["./initiative.component.css"],
    providers: [Angulartics2Mixpanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class InitiativeComponent implements OnChanges {

    @Output() edited: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output("editTags") editTags: EventEmitter<any> = new EventEmitter<any>();

    @Input() node: Initiative;
    @Input() dataset: DataSet;
    @Input() team: Team;

    isEditMode: boolean = true;

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
    @ViewChild("inputTag") public inputTag: NgbTypeahead;

    focus$ = new Subject<string>();
    click$ = new Subject<string>();
    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
    MESSAGE_PERMISSIONS_DENIED_EDIT = environment.MESSAGE_PERMISSIONS_DENIED_EDIT;

    constructor(private auth: Auth, private teamFactory: TeamFactory, private userFactory: UserFactory,
        private userService: UserService,
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

                this.members$ = this.team$
                    .then((team: Team) => {
                        return this.userService.getUsersInfo(team.members)
                            .then(members => compact(members))
                            .then(members => sortBy(members, m => m.name))
                    })
            }

        }

        this.cd.markForCheck();

    }

    ngOnInit() {
        this.auth.getUser().subscribe(user => this.user = user)
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.cd.markForCheck();
    }

    onBlur() {

        this.edited.emit(true);
    }

    saveName(newName: string) {
        this.node.name = newName;
        this.analytics.eventTrack("Initiative", { action: "change name", team: this.teamName, teamId: this.teamId });
        this.onBlur();
        this.cd.markForCheck();
    }

    saveTags(newTags: Array<Tag>) {
        this.node.tags = newTags;
        this.analytics.eventTrack("Initiative", { action: "edit tags", team: this.teamName, teamId: this.teamId });
        this.onBlur();
        this.cd.markForCheck();
    }

    saveAccountable(accountable: Helper) {
        console.log("saveAccountable", accountable);
        this.node.accountable = accountable;
        if (accountable) {
            if (this.node.helpers.map(h => h.user_id).includes(accountable.user_id)) {
                let helper = this.node.helpers.filter(h => h.hasAuthorityPrivileges)[0]
                let roles = helper.roles;
                this.removeHelper(helper);
                this.node.accountable.roles = roles;
            }
        }

        this.onBlur();
        this.getAllHelpers();
        this.cd.markForCheck();
        this.analytics.eventTrack("Initiative", { action: "add authority", team: this.teamName, teamId: this.teamId });
    }

    saveDescription(newDesc: string) {
        this.node.description = newDesc;
        this.onBlur();
    }

    saveHelpers(helpers:Helper[]){
        this.node.helpers = helpers;
        // this.onBlur();
        this.cd.markForCheck();
    }

    removeHelper(helper: Helper) {
        let index = this.node.helpers.findIndex(user => user.user_id === helper.user_id);
        this.node.helpers.splice(index, 1);
        // this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "remove helper", team: this.teamName, teamId: this.teamId });
    }


    getSummaryUrl(user:User){
        return `/map/${this.dataset.datasetId}/${this.dataset.initiative.getSlug()}/summary?member=${user.shortid}`
    }



    openTagsPanel() {
        this.editTags.emit();
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

  

    isAuthority(helper: Helper) {
        return this.node.accountable && this.node.accountable.user_id === helper.user_id
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
     }



  
}




