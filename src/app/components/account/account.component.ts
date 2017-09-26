import { Subscription } from "rxjs/Rx";
import { TeamComponent } from "./../team/team.component";
import { TeamFactory } from "./../../shared/services/team.factory";
import { EmitterService } from "./../../shared/services/emitter.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { Router } from "@angular/router";
import { DataSet } from "./../../shared/model/dataset.data";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { User } from "./../../shared/model/user.data";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Team } from "../../shared/model/team.data";
import { UserFactory } from "../../shared/services/user.factory";

@Component({
    selector: "account",
    template: require("./account.component.html"),
    styleUrls: ["./account.component.css"]
})
export class AccountComponent implements OnInit {

    private user: User;
    public datasets$: Promise<Array<DataSet>>;
    subscription: Subscription;

    @ViewChild(TeamComponent) teamComponent: TeamComponent;

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    constructor(private auth: Auth, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private errorService: ErrorService) {
        this.subscription = this.auth.getUser().subscribe((user: User) => {
            this.auth.getUserInfo(user.user_id).then(u => {
                this.user = u
            })
        },
            (error: any) => { this.errorService.handleError(error) });
    }

    ngOnInit() {
    }
}