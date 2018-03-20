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
    EmbeddedViewRef
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

    constructor(private _viewContainer: ViewContainerRef, templateRef: TemplateRef<HasPermissionContext>, private auth: Auth) {
        this._thenTemplateRef = templateRef;
        this.userPermissions = auth.getPermissions();
    }

    @Input()
    set hasPermission(permission: Permissions) {
        this.permission = permission;
        this._context.$implicit = this._context.hasPermission = this.checkPermission();
        this._updateView();
    }

    @Input()
    set hasPermissionThen(templateRef: TemplateRef<HasPermissionContext> | null) {
        this._thenTemplateRef = templateRef;
        this._thenViewRef = null;  // clear previous view if any.
        this._updateView();
    }

    @Input()
    set hasPermissionElse(templateRef: TemplateRef<HasPermissionContext> | null) {
        this._elseTemplateRef = templateRef;
        this._elseViewRef = null;  // clear previous view if any.
        this._updateView();
    }

    private _updateView() {
        if (this._context.$implicit) {
            if (!this._thenViewRef) {
                this._viewContainer.clear();
                this._elseViewRef = null;
                if (this._thenTemplateRef) {
                    this._thenViewRef =
                        this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
                }
            }
        } else {
            if (!this._elseViewRef) {
                this._viewContainer.clear();
                this._thenViewRef = null;
                if (this._elseTemplateRef) {
                    this._elseViewRef =
                        this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
                }
            }
        }
    }


    private checkPermission() {
        if (this.userPermissions) {
            return this.userPermissions.includes(this.permission);
        }
        return false;
    }
}

export class HasPermissionContext {
    public $implicit: any = null;
    public hasPermission: any = null;
}