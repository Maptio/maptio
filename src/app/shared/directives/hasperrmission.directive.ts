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
    Attribute
} from "@angular/core";

@Directive({
    selector: "[hasPermission]"
})
export class HasPermissionDirective implements OnInit {
    private userPermissions: Permissions[];
    private permission: Permissions;
    private logicalOp = "AND";
    private isHidden = true;

    constructor(
        private element: ElementRef,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private auth: Auth
    ) {

    }

    ngOnInit() {
        this.auth.getPermissions().subscribe(ps => {
            this.userPermissions = ps;
            this.updateView();
        });
    }

    @Input()
    set hasPermission(val: Permissions) {
        this.permission = val;
        this.updateView();
    }

    private updateView() {
        if (this.checkPermission()) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }

    private checkPermission() {
        if (this.userPermissions) {
            return this.userPermissions.includes(this.permission);
        }
        return false;
    }
}
