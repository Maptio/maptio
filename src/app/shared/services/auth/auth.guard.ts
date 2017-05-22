import { Auth } from "./auth.service";
import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {
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
}