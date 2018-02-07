import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from "@angular/router";
import { Auth } from "../auth/auth.service";
import { UIService } from "../ui/ui.service";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private auth: Auth, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        let url: string = state.url;

        if (this.auth.authenticated() && this.auth.authenticationProviderAuthenticated() && this.auth.internalApiAuthenticated()) {
            return true;
        }

        // if the session is over, lets clear all and start again
        localStorage.clear();

        localStorage.setItem("redirectUrl", url);
        this.router.navigate(["/login"]);
        return false;
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(childRoute, state)
    }
}


@Injectable()
export class MapGuard implements CanActivate, CanActivateChild {

    constructor(private uiService:UIService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.uiService.clean();
        return true;
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(childRoute, state)
    }
}

