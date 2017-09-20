import { TeamFactory } from "./../../../shared/services/team.factory";
import { map } from "rxjs/operator/map";
import { UserFactory } from "./../../../shared/services/user.factory";
import { DataSet } from "./../../../shared/model/dataset.data";
import { ActivatedRoute, Params } from "@angular/router";
import { DatasetFactory } from "./../../../shared/services/dataset.factory";
import { User } from "./../../../shared/model/user.data";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { Initiative } from "./../../../shared/model/initiative.data";
import { D3Service, D3 } from "d3-ng2-service";
import { Observable, Subscription } from "rxjs/Rx";
import { IDataVisualizer } from "./../mapping.interface";
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { ColorService } from "../../../shared/services/ui/color.service";
import { UIService } from "../../../shared/services/ui/ui.service";
import { Team } from "../../../shared/model/team.data";

@Component({
    selector: "member-summary",
    template: require("./member-summary.component.html"),
    styleUrls: ["./member-summary.component.css"]
})

export class MemberSummaryComponent implements OnInit {

    private userSubscription: Subscription;
    private routeSubscription: Subscription;
    public member$: Promise<User>;
    public team$: Promise<Team>
    public datasetId: string;
    public memberId: string;
    public initiative: Initiative;
    authorities: Array<Initiative> = [];
    helps: Array<Initiative> = [];

    constructor(public auth: Auth, public route: ActivatedRoute, public datasetFactory: DatasetFactory, public userFactory: UserFactory, public teamFactory: TeamFactory) {
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            // console.log(params)
            this.datasetId = params["mapid"];
            this.memberId = params["userid"];
            this.member$ = this.userFactory.get(this.memberId);
            this.authorities = [];
            this.helps = [];
            if (this.datasetId && this.memberId) {

                this.datasetFactory.get(this.datasetId).then((dataset: DataSet) => {
                    this.initiative = dataset.initiative;
                    // console.log(initiative)
                    this.initiative.traverse(function (i: Initiative) {
                        if (i.accountable && i.accountable.user_id === this.memberId) {
                            if (!this.authorities.includes(i)) this.authorities.push(i)
                        }
                        if (i.helpers && i.helpers.find(h => h.user_id === this.memberId)) {
                            if (!this.helps.includes(i)) this.helps.push(i)
                        }
                    }.bind(this));

                    this.authorities.forEach((i: Initiative) => {
                        Promise.all(
                            i.helpers.map(
                                m => this.auth.getUserInfo(m.user_id)
                                    .then(m => m, (reason) => { return Promise.reject(reason) })
                                    .catch(() => { m.isDeleted = true; return m })))
                            .then(members => i.helpers = members)
                    })

                    this.helps.forEach((i: Initiative) => {
                        Promise.all(
                            i.helpers.map(
                                m => this.auth.getUserInfo(m.user_id)
                                    .then(m => m, (reason) => { return Promise.reject(reason) })
                                    .catch(() => { m.isDeleted = true; return m })))
                            .then(members => i.helpers = members);

                        this.auth.getUserInfo(i.accountable.user_id)
                            .then(m => { i.accountable = m }, (reason) => { return Promise.reject(reason) })

                    })
                    return dataset;
                }, () => { })
                    .then((d: DataSet) => {
                        this.team$ = this.teamFactory.get(d.initiative.team_id)
                    })
            }

        })
    }


    ngOnInit() {

    }



    ngOnDestroy() {
        if (this.userSubscription)
            this.userSubscription.unsubscribe()
        if (this.routeSubscription)
            this.routeSubscription.unsubscribe()
    }
}