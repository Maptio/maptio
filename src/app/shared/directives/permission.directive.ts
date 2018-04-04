import { Helper } from './../model/helper.data';
import { Initiative } from "./../model/initiative.data";
import { Permissions } from "./../model/permission.data";
import { Auth } from "./../services/auth/auth.service";
import {
    Directive,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewContainerRef,
    SimpleChanges
} from "@angular/core";
// import { NgxPermissionsService } from "../service/permissions.service";
import { Subscription } from "rxjs/Subscription";
// import { NgxRolesService } from "../service/roles.service";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/skip";
// import { isBoolean, isFunction, isString, notEmptyValue } from "../utils/utils";
// import { NgxPermissionsConfigurationService, StrategyFunction } from "../service/configuration.service";
// import { NgxPermissionsPredefinedStrategies } from "../enums/predefined-strategies.enum";
import { Observable } from "rxjs/Observable";

export type StrategyFunction = (templateRef?: TemplateRef<any>) => void;


@Directive({
    selector: "[permissionsOnly]"
})
export class PermissionsDirective implements OnInit, OnDestroy {

    permission: Permissions;
    initiative: Initiative;
    helper: Helper;

    @Input()
    set permissionsOnly(p: Permissions) {
        this.permission = p;
    };

    @Input()
    set permissionsOnlyInitiative(i: Initiative) {
        this.initiative = i;
    };

    @Input()
    set permissionsOnlyHelper(h: Helper) {
        this.helper = h;
    };

    @Input() permissionsOnlyThen: TemplateRef<any>;
    @Input() permissionsOnlyElse: TemplateRef<any>;

    @Input() permissionsThen: TemplateRef<any>;
    @Input() permissionsElse: TemplateRef<any>;

    @Input() permissionsOnlyUnauthorisedStrategy: StrategyFunction;
    @Input() permissionsOnlyAuthorisedStrategy: StrategyFunction;

    @Output() permissionsAuthorized = new EventEmitter();
    @Output() permissionsUnauthorized = new EventEmitter();

    private initPermissionSubscription: Subscription;
    // skip first run cause merge will fire twice
    private firstMergeUnusedRun = 1;
    private currentAuthorizedState: boolean;

    private userPermissions: Permissions[];
    private userId: string;

    constructor(
        private viewContainer: ViewContainerRef,
        private templateRef: TemplateRef<any>,
        private auth: Auth
    ) {
        this.userPermissions = auth.getPermissions();
        if (localStorage.getItem("profile")) {
            this.userId = JSON.parse(localStorage.getItem("profile")).user_id
        }
    }


    ngOnChanges(changes: SimpleChanges) {
        // console.log("changes", changes)

        if (changes.permissionsOnlyInitiative) {
            if (changes.permissionsOnlyInitiative.isFirstChange()) {
                this.initiative = changes.permissionsOnlyInitiative.currentValue;
            }
            else if (changes.permissionsOnlyInitiative.previousValue.id !== changes.permissionsOnlyInitiative.currentValue.id) {
                this.initiative = changes.permissionsOnlyInitiative.currentValue;
                this.validateExceptOnlyPermissions();
            }
            else {
                this.initiative = null;
            }
        }
        else {
            this.initiative = null;
        }

        if (changes.permissionsOnlyHelper) {
            if (changes.permissionsOnlyHelper.isFirstChange()) {
                this.initiative = changes.permissionsOnlyHelper.currentValue;
            }
            else if (changes.permissionsOnlyHelper.previousValue.user_id !== changes.permissionsOnlyHelper.currentValue.user_id) {
                this.helper = changes.permissionsOnlyHelper.currentValue;
                this.validateExceptOnlyPermissions();
            }
            else {
                this.helper = null;
            }
        }
        else {
            this.helper = null;
        }

        // if (changes.permissionsOnly) {
        //     this.permission = changes.permissionsOnly.currentValue
        // }

        // if (changes.permissionsOnlyThen) {
        //     this.permissionsOnlyThen = changes.permissionsOnlyThen.currentValue
        // }

        // if (changes.permissionsOnlyElse) {
        //     this.permissionsOnlyElse = changes.permissionsOnlyElse.currentValue
        // }
    }

    ngOnInit(): void {
        this.viewContainer.clear();
        this.initPermissionSubscription = this.validateExceptOnlyPermissions();
    }

    ngOnDestroy(): void {
        if (this.initPermissionSubscription) {
            this.initPermissionSubscription.unsubscribe();
        }
    }

    private validateExceptOnlyPermissions(): Subscription {
        // if (this.initiative) console.log("checking for ", Permissions[this.permission], "in", this.initiative.name)
        return Observable.of(this.userPermissions)
            // this.permissionsService.permissions$
            // .merge(this.rolesService.roles$)
            // .skip(this.firstMergeUnusedRun)
            .subscribe(() => {
                // if (notEmptyValue(this.ngxPermissionsExcept)) {
                //     this.validateExceptAndOnlyPermissions();
                //     return;
                // }

                if (this.permission) {
                    this.validateOnlyPermissions();
                    return;
                }

                this.handleAuthorisedPermission(this.getAuthorisedTemplates());
            });
    }

    // private validateExceptAndOnlyPermissions(): void {
    //     Promise.all([this.permissionsService.hasPermission(this.ngxPermissionsExcept), this.rolesService.hasOnlyRoles(this.ngxPermissionsExcept)])
    //         .then(([hasPermission, hasRole]) => {
    //             if (hasPermission || hasRole) {
    //                 this.handleUnauthorisedPermission(this.ngxPermissionsExceptElse || this.permissionsElse);
    //             } else {
    //                 if (!!this.permissionsOnly) {
    //                     throw false;
    //                 } else {
    //                     this.handleAuthorisedPermission(this.ngxPermissionsExceptThen || this.permissionsThen || this.templateRef);
    //                 }
    //             }
    //         }).catch(() => {
    //             if (!!this.permissionsOnly) {
    //                 this.validateOnlyPermissions();
    //             } else {
    //                 this.handleAuthorisedPermission(this.ngxPermissionsExceptThen || this.permissionsThen || this.templateRef);
    //             }
    //         });
    // }

    private validateOnlyPermissions(): void {
        // console.log("validateOnlyPermissions")
        // Promise.all([this.permissionsService.hasPermission(this.permissionsOnly)/*, this.rolesService.hasOnlyRoles(this.permissionsOnly)*/])
        //     .then(([permissionPr/*, roles*/]) => {
        //         if (permissionPr || roles) {
        //             this.handleAuthorisedPermission(this.permissionsOnlyThen || this.permissionsThen || this.templateRef);
        //         } else {
        //             this.handleUnauthorisedPermission(this.permissionsOnlyElse || this.permissionsElse);
        //         }
        //     }).catch(() => {
        //         this.handleUnauthorisedPermission(this.permissionsOnlyElse || this.permissionsElse);
        //     });
        if (this.checkPermission()) {
            // console.log("true", this.permissionsOnlyThen || this.permissionsThen || this.templateRef)
            this.handleAuthorisedPermission(this.permissionsOnlyThen || this.permissionsThen || this.templateRef);
        } else {
            // console.log("false", this.permissionsOnlyElse || this.permissionsElse)
            this.handleUnauthorisedPermission(this.permissionsOnlyElse || this.permissionsElse);
        }
    }

    private handleUnauthorisedPermission(template: TemplateRef<any>): void {

        if (!this.isBoolean(this.currentAuthorizedState) || this.currentAuthorizedState) {
            this.currentAuthorizedState = false;
            this.permissionsUnauthorized.emit();

            if (this.unauthorisedStrategyDefined()) {
                // if (isString(this.unauthorisedStrategyDefined())) {
                //     this.applyStrategy(this.unauthorisedStrategyDefined());
                // } else
                if (this.isFunction(this.unauthorisedStrategyDefined())) {
                    this.showTemplateBlockInView(this.templateRef);
                    (this.unauthorisedStrategyDefined() as Function)(this.templateRef)
                }
                return;
            }

            // if (this.configurationService.onUnAuthorisedDefaultStrategy && this.noElseBlockDefined()) {
            //     this.applyStrategy(this.configurationService.onUnAuthorisedDefaultStrategy);
            // } else {
            this.showTemplateBlockInView(template);
            // }

        }
    }

    private handleAuthorisedPermission(template: TemplateRef<any>): void {
        if (!this.isBoolean(this.currentAuthorizedState) || !this.currentAuthorizedState) {
            this.currentAuthorizedState = true;
            this.permissionsAuthorized.emit();

            if (this.onlyAuthorisedStrategyDefined()) {
                // if (this.isString(this.onlyAuthorisedStrategyDefined())) {
                //     this.applyStrategy(this.onlyAuthorisedStrategyDefined());
                // } else
                if (this.isFunction(this.onlyAuthorisedStrategyDefined())) {
                    this.showTemplateBlockInView(this.templateRef);
                    (this.onlyAuthorisedStrategyDefined() as Function)(this.templateRef)
                }
                return;
            }

            // if (this.configurationService.onAuthorisedDefaultStrategy && this.noThenBlockDefined()) {
            //     this.applyStrategy(this.configurationService.onAuthorisedDefaultStrategy);
            // } else {
            this.showTemplateBlockInView(template);
            // }
        }
    }

    private showTemplateBlockInView(template: TemplateRef<any>): void {
        this.viewContainer.clear();
        if (!template) {
            return;
        }

        this.viewContainer.createEmbeddedView(template);
    }

    private getAuthorisedTemplates(): TemplateRef<any> {
        return this.permissionsOnlyThen
            // || this.ngxPermissionsExceptThen
            || this.permissionsThen
            || this.templateRef
    }

    private noElseBlockDefined(): boolean {
        return /*!this.ngxPermissionsExceptElse ||*/ !this.permissionsElse;
    }

    private noThenBlockDefined() {
        return /*!this.ngxPermissionsExceptThen ||*/ !this.permissionsThen;
    }

    private onlyAuthorisedStrategyDefined() {
        return this.permissionsOnlyAuthorisedStrategy; /*this.ngxPermissionsOnlyAuthorisedStrategy ||
            this.ngxPermissionsExceptAuthorisedStrategy ||*/

    }

    private unauthorisedStrategyDefined() {
        return this.permissionsOnlyUnauthorisedStrategy;
        // return this.ngxPermissionsOnlyUnauthorisedStrategy ||
        //     this.ngxPermissionsExceptUnauthorisedStrategy ||
        //     this.ngxPermissionsUnauthorisedStrategy
    }

    // private applyStrategy(str: any) {
    //     if (str === NgxPermissionsPredefinedStrategies.SHOW) {
    //         this.showTemplateBlockInView(this.templateRef);
    //         return;
    //     }

    //     if (str === NgxPermissionsPredefinedStrategies.REMOVE) {
    //         this.viewContainer.clear();
    //         return;
    //     }
    //     const strategy = this.configurationService.getStrategy(str);
    //     this.showTemplateBlockInView(this.templateRef);
    //     strategy(this.templateRef);
    // }

    private isBoolean(value: any): value is boolean {
        return typeof value === "boolean";
    }

    private isString(value: any): value is string {
        return !!value && typeof value === "string";
    }

    private isFunction(functionToCheck: any): functionToCheck is Function {
        let getType = {};
        return !!functionToCheck && functionToCheck instanceof Function && getType.toString.call(functionToCheck) === "[object Function]";
    }

    private checkPermission() {
        // ("checkPermissions", Permissions[this.permission], this.initiative)
        switch (this.permission) {
            case Permissions.canMoveInitiative:
                return this.canMoveInitiative();
            case Permissions.canDeleteInitiative:
                return this.canDeleteInitiative();
            case Permissions.canEditInitiativeName:
                return this.canEditInitiativeName();
            case Permissions.canEditInitiativeDescription:
                return this.canEditInitiativeDescription();
            case Permissions.canEditInitiativeTags:
                return this.canEditInitiativeTags();
            case Permissions.canEditInitiativeAuthority:
                return this.canEditInitiativeAuthority();
            case Permissions.canAddHelper:
                return this.canAddHelper();
            case Permissions.canDeleteHelper:
                return this.canDeleteHelper();
            default:
                return this.userPermissions.includes(this.permission);
        }
    }

    private canMoveInitiative(): boolean {
        return this.userPermissions.includes(Permissions.canMoveInitiative)
    }

    private canEditInitiativeName(): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeName)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)

    }

    private canEditInitiativeDescription(): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeDescription)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)

    }

    private canEditInitiativeTags(): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeTags)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)

    }

    private canEditInitiativeAuthority(): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeAuthority)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)

    }

    private canAddHelper(): boolean {
        return this.userPermissions.includes(Permissions.canAddHelper)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)

    }

    private canDeleteHelper(): boolean {
        return this.userPermissions.includes(Permissions.canDeleteHelper)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.helper.user_id === this.userId)

    }

    private canDeleteInitiative(): boolean {
        return this.userPermissions.includes(Permissions.canDeleteInitiative)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)

    }
}