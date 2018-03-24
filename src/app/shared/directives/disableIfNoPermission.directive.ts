import { Auth } from "./../services/auth/auth.service";
import { Permissions } from "./../model/permission.data";
import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
    selector: "[disableIfNoPermission]"
})
export class DisableIfNoPermission {
    @Input("disableIfNoPermission") permission: Permissions;

    userPermissions: Permissions[];

    constructor(private el: ElementRef, auth: Auth) {
        this.userPermissions = auth.getPermissions();
    }

    ngOnInit() {
        if (!this.checkPermission()) {
            (this.el.nativeElement as HTMLElement).setAttribute("disabled", "");
            (this.el.nativeElement as HTMLElement).classList.add("disabled", "locked")
        }
    }

    private checkPermission() {
        console.log("check permissions", this.userPermissions, this.permission)
        if (this.userPermissions) {
            return this.userPermissions.includes(this.permission);
        }
        return false;
    }
}