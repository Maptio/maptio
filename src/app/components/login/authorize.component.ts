import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { URIService } from '../../shared/services/uri.service';
import { JwtHelper } from 'angular2-jwt';
import { AuthConfiguration } from '../../shared/services/auth/auth.config';
import { Auth } from '../../shared/services/auth/auth.service';

@Component({
    selector: 'authorize',
    template: ''
})
export class AuthorizeComponent implements OnInit {

    subscription: Subscription;
    constructor(private route: ActivatedRoute, private router: Router, private uriService: URIService, private auth: Auth, private authConfig: AuthConfiguration) { }

    ngOnInit(): void {
        this.subscription = this.route.fragment
            .map(fragment => this.uriService.parseFragment(fragment).get("id_token"))
            .map(token => new JwtHelper().decodeToken(token))
            .map((profile: string) => {
                localStorage.setItem("profile", JSON.stringify(profile));
            })
            .flatMap(() => {
                return Observable.fromPromise(this.auth.loginMaptioApiSSO());
            })
            .map((tokens: { accessToken: string, idToken: string }) => {
                localStorage.setItem("maptio_api_token", tokens.accessToken);
                localStorage.setItem("id_token", tokens.idToken);
            })
            .flatMap(() => {
                return Observable.fromPromise(this.authConfig.getAccessToken())
            })
            .map(accessToken => {
                localStorage.setItem("access_token", accessToken);
            })
            .subscribe(() => {
                this.router.navigateByUrl("/home");
            })
    }
}
