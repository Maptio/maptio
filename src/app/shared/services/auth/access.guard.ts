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
        let dataset = route.params["mapid"];
        let team = route.params["teamid"];
        return this.auth.getUser().map(u => {
            if (dataset && u.datasets.includes(dataset)) {
                return true
            }
            else if (team && u.teams.includes(team)) {
                return true;
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