
import {of as observableOf,  Subscription ,  Observable } from 'rxjs';
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
import { PermissionsService } from "../services/permissions/permissions.service";

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

    @Input() permissionOnlyTarget: string;

    @Output() authorized = new EventEmitter();
    @Output() unauthorized = new EventEmitter();

    private initPermissionSubscription: Subscription;
    private currentAuthorizedState: boolean;

    private userPermissions: Permissions[];
    private userId: string;

    constructor(
        private viewContainer: ViewContainerRef,
        private templateRef: TemplateRef<any>,
        private auth: Auth,
        private permissionService: PermissionsService
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
        return observableOf(this.userPermissions)
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
            this.unauthorized.emit();

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
            this.authorized.emit();

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
        return !this.permissionsThen;
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
                return this.permissionService.canMoveInitiative();
            case Permissions.canDeleteInitiative:
                return this.permissionService.canDeleteInitiative(this.initiative);
            case Permissions.canEditInitiativeName:
                return this.permissionService.canEditInitiativeName(this.initiative);
            case Permissions.canEditInitiativeDescription:
                return this.permissionService.canEditInitiativeDescription(this.initiative);
            case Permissions.canEditInitiativeTags:
                return this.permissionService.canEditInitiativeTags(this.initiative);
            case Permissions.canEditInitiativeAuthority:
                return this.permissionService.canEditInitiativeAuthority(this.initiative);
            case Permissions.canAddHelper:
                return this.permissionService.canAddHelper(this.initiative);
            case Permissions.canDeleteHelper:
                return this.permissionService.canDeleteHelper(this.initiative, this.helper);
            case Permissions.canEditHelper:
                return this.permissionService.canEditHelper(this.initiative, this.helper);
            case Permissions.canEditVacancies:
                return this.permissionService.canEditVacancies();
            case Permissions.canGiveHelperPrivileges:
                return this.permissionService.canGiveHelperPrivilege(this.initiative)
            default:
                return this.userPermissions.includes(this.permission);
        }
    }


}
