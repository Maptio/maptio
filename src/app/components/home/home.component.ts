import { Auth } from "./../../shared/services/auth/auth.service";
import { Component } from "@angular/core";

@Component({
    selector: "home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent {

    public invitedEmail: string;
    public isActivationPending: Promise<boolean>;

    // private routeSubscription: Subscription;

    constructor(public auth: Auth) { }

}