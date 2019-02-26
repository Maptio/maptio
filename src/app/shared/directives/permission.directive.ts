import { Helper } from "./../model/helper.data";
import { Initiative } from "./../model/initiative.data";
import { Permissions } from "./../model/permission.data";
import { Auth } from "../../core/authentication/auth.service";
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
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/skip";
import { Observable } from "rxjs/Rx";

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
                this.helper = changes.permissionsOnlyHelper.currentValue;
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
        return Observable.of(this.userPermissions)
            .subscribe(() => {
                if (this.permission) {
                    this.validateOnlyPermissions();
                    return;
                }
                this.handleAuthorisedPermission(this.getAuthorisedTemplates());
            });
    }


    private validateOnlyPermissions(): void {
        if (this.checkPermission()) {
            this.handleAuthorisedPermission(this.permissionsOnlyThen || this.permissionsThen || this.templateRef);
        } else {
            this.handleUnauthorisedPermission(this.permissionsOnlyElse || this.permissionsElse);
        }
    }

    private handleUnauthorisedPermission(template: TemplateRef<any>): void {

        if (!this.isBoolean(this.currentAuthorizedState) || this.currentAuthorizedState) {
            this.currentAuthorizedState = false;
            this.permissionsUnauthorized.emit();

            if (this.unauthorisedStrategyDefined()) {
                if (this.isFunction(this.unauthorisedStrategyDefined())) {
                    this.showTemplateBlockInView(this.templateRef);
                    (this.unauthorisedStrategyDefined() as Function)(this.templateRef)
                }
                return;
            }
            this.showTemplateBlockInView(template);
        }
    }

    private handleAuthorisedPermission(template: TemplateRef<any>): void {
        if (!this.isBoolean(this.currentAuthorizedState) || !this.currentAuthorizedState) {
            this.currentAuthorizedState = true;
            this.permissionsAuthorized.emit();

            if (this.onlyAuthorisedStrategyDefined()) {
                if (this.isFunction(this.onlyAuthorisedStrategyDefined())) {
                    this.showTemplateBlockInView(this.templateRef);
                    (this.onlyAuthorisedStrategyDefined() as Function)(this.templateRef)
                }
                return;
            }
            this.showTemplateBlockInView(template);
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
            || this.permissionsThen
            || this.templateRef
    }

    private noElseBlockDefined(): boolean {
        return !this.permissionsElse;
    }

    private noThenBlockDefined() {
        return  !this.permissionsThen;
    }

    private onlyAuthorisedStrategyDefined() {
        return this.permissionsOnlyAuthorisedStrategy;

    }

    private unauthorisedStrategyDefined() {
        return this.permissionsOnlyUnauthorisedStrategy;
    }

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
            case Permissions.canEditHelper:
                return this.canEditHelper();
            case Permissions.canGiveHelperPrivileges:
                return this.canGiveHelperPrivilege()
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
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }

    private canEditInitiativeDescription(): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeDescription)
            ||
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }

    private canEditInitiativeTags(): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeTags)
            ||
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }

    private canEditInitiativeAuthority(): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeAuthority)
            ||
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
    }

    private canAddHelper(): boolean {
        return this.userPermissions.includes(Permissions.canAddHelper)
            ||
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }

    private canDeleteHelper(): boolean {
        return this.userPermissions.includes(Permissions.canDeleteHelper)
            ||
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.helper.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }

    private canEditHelper(): boolean {
        return this.userPermissions.includes(Permissions.canEditHelper)
            ||
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.helper.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }

    private canGiveHelperPrivilege(): boolean {
        return this.userPermissions.includes(Permissions.canEditHelper)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }

    private canDeleteInitiative(): boolean {
        return this.userPermissions.includes(Permissions.canDeleteInitiative)
            ||
            !this.initiative.accountable
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
            ||
            (this.initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))

    }
}