import { Initiative } from './../model/initiative.data';
import { Permissions } from "./../model/permission.data";
import { User } from "./../model/user.data";
import { Auth } from "./../services/auth/auth.service";
import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    ElementRef,
    OnInit,
    Attribute,
    EmbeddedViewRef,
    SimpleChanges
} from "@angular/core";


@Directive({ selector: "[hasPermission]" })
export class HasPermissionDirective {
    private _context: HasPermissionContext = new HasPermissionContext();
    private _thenTemplateRef: TemplateRef<HasPermissionContext> | null = null;
    private _elseTemplateRef: TemplateRef<HasPermissionContext> | null = null;
    private _thenViewRef: EmbeddedViewRef<HasPermissionContext> | null = null;
    private _elseViewRef: EmbeddedViewRef<HasPermissionContext> | null = null;

    private userPermissions: Permissions[];
    private permission: Permissions;
    private initiative: Initiative;
    private userId: string;

    constructor(private _viewContainer: ViewContainerRef, templateRef: TemplateRef<HasPermissionContext>, private auth: Auth) {
        this._thenTemplateRef = templateRef;
        this.userPermissions = auth.getPermissions();
        if (localStorage.getItem("profile")) {
            this.userId = JSON.parse(localStorage.getItem("profile")).user_id
        }

    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log("ngOnChanges", this.permission, this.initiative, this._thenTemplateRef, this._elseTemplateRef)
        this._context.$implicit = this._context.hasPermission = this.checkPermission();
        // console.log("checkPermissions", this._context.$implicit)
        this._updateView();
    }


    @Input()
    set hasPermission(permission: Permissions) {
        // console.log("set Permissions")
        this.permission = permission;
        //this._updateView();
    }

    @Input()
    set hasPermissionInitiative(initiative: Initiative) {
        // console.log("set Initiative")
        this.initiative = initiative;
        //this._updateView();
    }

    @Input()
    set hasPermissionThen(templateRef: TemplateRef<HasPermissionContext> | null) {
        // console.log("set Then template")
        this._thenTemplateRef = templateRef;
        this._thenViewRef = null;  // clear previous view if any.
        //this._updateView();
    }

    @Input()
    set hasPermissionElse(templateRef: TemplateRef<HasPermissionContext> | null) {
        // console.log("set Else template")
        this._elseTemplateRef = templateRef;
        this._elseViewRef = null;  // clear previous view if any.
        //this._updateView();
    }

    private _updateView() {
        // console.log("update view", this._context.$implicit, this._thenViewRef, this._elseViewRef)
        if (this._context.$implicit) {
            if (!this._thenViewRef) {
                this._viewContainer.clear();
                this._elseViewRef = null;
                if (this._thenTemplateRef) {
                    console.log("then")
                    this._thenViewRef =
                        this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
                }
            }
        } else {
            if (!this._elseViewRef) {
                this._viewContainer.clear();
                this._thenViewRef = null;
                if (this._elseTemplateRef) {
                    // console.log("else")
                    this._elseViewRef =
                        this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
                }
            }
        }
    }

    // private checkPermission() {
    //     console.log(this.permission, this.userPermissions, this.initiative)
    //     if (this.userPermissions) {
    //         return this.userPermissions.includes(this.permission);
    //     }
    //     return false;
    // }

    private checkPermission() {

        switch (this.permission) {
            case Permissions.canMoveInitiative:
                return this.canMoveInitiative();
            case Permissions.canDeleteInitiative:
                return this.canDeleteInitiative();
            default:
            return this.userPermissions.includes(this.permission);
        }
    }

    private canMoveInitiative(): boolean {
        return this.userPermissions.includes(Permissions.canMoveInitiative)
    }

    private canDeleteInitiative(): boolean {
        // console.log(this.permission, this.userPermissions, this.userId, this.initiative)
        return this.userPermissions.includes(Permissions.canDeleteInitiative)
            ||
            (this.initiative.accountable && this.initiative.accountable.user_id === this.userId)
    }
}

export class HasPermissionContext {
    public $implicit: any = null;
    public hasPermission: any = null;
}