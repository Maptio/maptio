import { Auth } from "./auth.service";
import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private auth: Auth, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        if (this.auth.authenticated()) {
            return true;
        }

        localStorage.setItem("redirectUrl", url);
        this.router.navigate(["/login"]);
        return false;
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(childRoute, state)
    }
}              

