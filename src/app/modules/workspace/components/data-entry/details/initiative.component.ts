import { environment } from "../../../../../config/environment";
import { Auth } from "../../../../../core/authentication/auth.service";
import { Permissions } from "../../../../../shared/model/permission.data";
import { Helper } from "../../../../../shared/model/helper.data";
import { DatasetFactory } from "../../../../../core/http/map/dataset.factory";
import { UserFactory } from "../../../../../core/http/user/user.factory";
import { TeamFactory } from "../../../../../core/http/team/team.factory";
import { Team } from "../../../../../shared/model/team.data";
import { DataSet } from "../../../../../shared/model/dataset.data";
import { User } from "../../../../../shared/model/user.data";
import { Tag } from "../../../../../shared/model/tag.data";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { Subject, Subscription } from "rxjs/Rx";
import { Component, Input, ViewChild, OnChanges, SimpleChanges, EventEmitter, Output, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, TemplateRef, Renderer2 } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import { NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { _catch } from "rxjs/operator/catch";
import { _do } from "rxjs/operator/do";
import { compact, sortBy, remove } from "lodash-es";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { UserService } from "../../../../../shared/services/user/user.service";
import { PermissionsService } from "../../../../../shared/services/permissions/permissions.service";

@Component({
    selector: "initiative",
    templateUrl: "./initiative.component.html",
    styleUrls: ["./initiative.component.css"],
    providers: [Angulartics2Mixpanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class InitiativeComponent implements OnChanges {

    @Input() node: Initiative;
    @Input() dataset: DataSet;
    @Input() team: Team;
    @Input() isEditMode: boolean;
    @Input() user: User;

    @Output() edited: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output("editTags") editTags: EventEmitter<any> = new EventEmitter<any>();

    public members$: Promise<User[]>;
    public dataset$: Promise<DataSet>
    public team$: Promise<Team>;
    public authority: string;
    public helper: string;

    isRestrictedAddHelper: boolean;
    hideme: Array<boolean> = [];
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
        private userService: UserService, private permissionsService: PermissionsService,
        private analytics: Angulartics2Mixpanel,
        private cd: ChangeDetectorRef) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.node && changes.node.currentValue) {
            this.isRestrictedAddHelper = false;
            if (changes.node.isFirstChange() || !(changes.node.previousValue) || changes.node.currentValue.team_id !== changes.node.previousValue.team_id) {

                this.team$ = this.teamFactory.get(<string>changes.node.currentValue.team_id)
                    .then(t => {
                        this.teamName = t.name;
                        this.teamId = t.team_id;
                        return t
                    },
                        () => { return Promise.reject("No organisation available") })
                    


                // this.members$ = this.team$
                //     .then((team: Team) => {
                //         return this.userService.getUsersInfo(team.members)
                //             .then(members => compact(members))
                //             .then(members => sortBy(members, m => m.name))
                //     })
            }

        }

        this.cd.markForCheck();

    }


    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.cd.markForCheck();
    }

    onBlur() {

        this.edited.emit(true);
    }

    canEditName() {
        return this.permissionsService.canEditInitiativeName(this.node);
    }

    canEditAuthority() {
        return this.permissionsService.canEditInitiativeAuthority(this.node);
    }

    canEditDescription() {
        return this.permissionsService.canEditInitiativeDescription(this.node);
    }

    canEditTags() {
        return this.permissionsService.canEditInitiativeTags(this.node);
    }

    canAddHelper() {
        return this.permissionsService.canAddHelper(this.node);
    }

    canEditHelper(helper: Helper) {
        return this.permissionsService.canEditHelper(this.node, helper);
    }

    canEditPrivilege() {
        return this.permissionsService.canGiveHelperPrivilege(this.node);
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
        // 1. brand new authority, just assign

        // 2. new person picked as authority, give them the roles from current authority

        // 3. authoriy picked from the list of current helpers, helper keeps their role

        let helpersIds = this.node.helpers.map(h => h.user_id);
        if (!accountable) {
            this.node.accountable = null;
        } else {
            if (!this.node.accountable) {
                this.node.accountable = accountable;
            }
            else if (this.node.accountable && helpersIds.indexOf(accountable.user_id) === -1) {
                accountable.roles = this.node.accountable.roles;
                this.node.accountable = accountable;

            } else {
                let helper = this.node.helpers.filter(h => h.user_id === accountable.user_id)[0]
                this.removeHelper(helper);
                this.node.accountable = helper;
            }
        }

        this.onBlur();
        this.cd.markForCheck();
        this.analytics.eventTrack("Initiative", { action: "add authority", team: this.teamName, teamId: this.teamId });
    }

    saveDescription(newDesc: string) {
        this.node.description = newDesc;
        this.onBlur();
    }

    addHelpers(helpers: Helper[]) {
        this.node.helpers = helpers;
        this.onBlur();
        this.cd.markForCheck();
    }

    removeHelper(helper: Helper) {
        let index = this.node.helpers.findIndex(user => user.user_id === helper.user_id);
        this.node.helpers.splice(index, 1);
        this.onBlur();
        this.analytics.eventTrack("Initiative", { action: "remove helper", team: this.teamName, teamId: this.teamId });
        this.cd.markForCheck();
    }

    saveHelpers() {
        this.onBlur();
    }


    getSummaryUrlRoot() {
        return `/map/${this.dataset.datasetId}/${this.dataset.initiative.getSlug()}/directory`
    }

    openTagsPanel() {
        this.editTags.emit();
    }



    trackByUserId(index: number, helper: Helper) {
        return helper.user_id;
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



    // saveHelper(newHelper: NgbTypeaheadSelectItemEvent) {
    //     if (this.node.helpers.findIndex(user => user.user_id === newHelper.item.user_id) < 0) {
    //         let helper = newHelper.item;
    //         helper.roles = [];
    //         this.node.helpers.unshift(helper);
    //     }
    //     this.onBlur();
    //     this.analytics.eventTrack("Initiative", { action: "add helper", team: this.teamName, teamId: this.teamId });
    // }

    // saveHelperRestricted(newHelper: NgbTypeaheadSelectItemEvent) {
    //     if (newHelper.item.user_id === this.user.user_id) {
    //         this.saveHelper({ item: this.user, preventDefault: null })
    //     } else {
    //         this.isRestrictedAddHelper = true;
    //     }
    //  }




}




