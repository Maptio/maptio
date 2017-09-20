import { User } from "./../../model/user.data";
import { Auth } from "./auth.service";
import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private auth: Auth, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        let url: string = state.url;

        if (this.auth.authenticated() && this.auth.apiAuthenticated()) {
            // console.log("authenticated")
            // this.auth.getUser().subscribe((user: User) => {
            //     this.auth.isEmailVerified(user.user_id).then((isEmailVerified: boolean) => {
            //         console.log("isEmailVerified", isEmailVerified)
            //         if (!isEmailVerified) {
            //             this.router.navigate(["/verify-email"]);
            //             return false;
            //         }
            //     })
            // })
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

