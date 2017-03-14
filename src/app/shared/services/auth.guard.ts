import { Auth } from './auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private auth: Auth, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        console.log(url);
        return this.checkLogin(url);
    }

    checkLogin(url: string): boolean {
        if (this.auth.authenticated()) { console.log("AUTHORIZED"); return true; }

        // Store the attempted URL for redirecting
        localStorage.setItem("redirectUrl", url); //this.auth.redirectUrl = url;
        console.log("SHOULD REDIRECT TO " + url)

        // Navigate to the login page with extras
        this.router.navigate(["/login"]);
        console.log("DENIED");
        return false;
    }
}