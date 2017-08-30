import { User } from "./../../model/user.data";
import { Auth } from "./auth.service";
import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private auth: Auth, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        if (this.auth.authenticated()) {
            console.log("authenticated")
            this.auth.getUser().subscribe((user: User) => {
                // this.auth.isFirstLogin(user.user_id).then((isFirstLogin: boolean) => {
                //     console.log("isFirstLogin", isFirstLogin)
                //     if (isFirstLogin) {
                //         this.router.navigate(["/change-password"]);
                //         return false;
                //     }
                // })
                this.auth.isEmailVerified(user.user_id).then((isEmailVerfied: boolean) => {
                    console.log("isEmailVerified", isEmailVerfied)
                    if (!isEmailVerfied) {
                        this.router.navigate(["/verify-email"]);
                        return false;
                    }
                })
            })
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

