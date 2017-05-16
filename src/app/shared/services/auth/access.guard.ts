import { Observable } from "rxjs/Rx";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { CanActivate, CanActivateChild, RouterStateSnapshot, Router } from "@angular/router";
import { Auth } from "./auth.service";

@Injectable()
export class AccessGuard implements CanActivate, CanActivateChild {

    constructor(private auth: Auth, private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

        let dataset = route.params["workspaceid"];
        return this.auth.getUser().map(u => {
            if (u.datasets.includes(dataset)) {
                return true
            }
            else {
                this.router.navigate(["/unauthorized"])
                return false;
            }
        })
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(childRoute, state);
    }

}