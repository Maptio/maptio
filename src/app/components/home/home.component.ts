import { Subscription } from "rxjs/Subscription";
import { UserFactory } from "./../../shared/services/user.factory";
import { JwtEncoder } from "./../../shared/services/encoding/jwt.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit } from "@angular/core";
import { User } from "../../shared/model/user.data";

@Component({
    selector: "home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {

    public invitedEmail: string;
    public isActivationPending: Promise<boolean>;

    private routeSubscription: Subscription;

    constructor(public auth: Auth) { }

    ngOnInit() {
        // this.routeSubscription = this.route.queryParams.subscribe((params: Params) => {

        //     let token = params["token"];
        //     if (token) {
        //         this.encoding.decode(token)
        //             .then((userInfo: any) => {
        //                 this.invitedEmail = userInfo.email
        //                 return userInfo.user_id;
        //             })
        //             .then((user_id: string) => {
        //                 this.isActivationPending = this.auth.isActivationPendingByUserId(user_id);
        //             })
        //     }
        // })
    }

    ngOnDestroy() {
        // if (this.routeSubscription) {
        //     this.routeSubscription.unsubscribe();
        // }
    }
}