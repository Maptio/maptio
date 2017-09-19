import { User } from './../../../shared/model/user.data';
import { Auth } from "./../../../shared/services/auth/auth.service";
import { Initiative } from "./../../../shared/model/initiative.data";
import { D3Service, D3 } from "d3-ng2-service";
import { Observable, Subscription } from "rxjs/Rx";
import { IDataVisualizer } from "./../mapping.interface";
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { ColorService } from "../../../shared/services/ui/color.service";
import { UIService } from "../../../shared/services/ui/ui.service";

@Component({
    selector: "first-person",
    template: require("./mapping.first-person.component.html"),
    styleUrls: ["./mapping.first-person.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MappingFirstPersonComponent implements OnInit, IDataVisualizer {
    width: number;
    height: number;
    margin: number;
    zoom$: Observable<number>;
    fontSize$: Observable<number>;
    user: Promise<User>;

    authorities: Array<Initiative> = [];
    helps: Array<Initiative> = [];

    private userSubscription: Subscription;

    constructor(public auth: Auth, public cd: ChangeDetectorRef) {
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe()
        }
    }

    draw(data: Initiative): void {
        this.userSubscription = this.auth.getUser().subscribe((user: User) => {
            this.user = Promise.resolve(user);

            this.user.then((user: User) => {

                data.traverse(function (i: Initiative) {
                    if (i.accountable && i.accountable.user_id === user.user_id) {
                        if (!this.authorities.includes(i)) this.authorities.push(i)
                    }
                    if (i.helpers && i.helpers.find(h => h.user_id === user.user_id)) {
                        if (!this.helps.includes(i)) this.helps.push(i)
                    }
                }.bind(this))
            });

            this.cd.markForCheck();
        });

    }
}