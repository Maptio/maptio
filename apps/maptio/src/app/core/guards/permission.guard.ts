import { Observable ,  of } from 'rxjs';
import { Permissions } from '../../shared/model/permission.data';
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { CanActivate, CanActivateChild, RouterStateSnapshot, Router } from "@angular/router";
import { UserService } from '@maptio-shared/services/user/user.service';

@Injectable()
export class PermissionGuard implements CanActivate, CanActivateChild {

    constructor(private userService: UserService, private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const userPermissions = this.userService.getPermissions();
        route.data.permissions.forEach((required: Permissions) => {
            if (!userPermissions.includes(required)) {
                this.router.navigate(["/unauthorized"])
            }
        });

        return of(true);
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(childRoute, state);
    }

}
