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
    templateUrl: "./member-summary.component.html",
    styleUrls: ["./member-summary.component.css"]
})

export class MemberSummaryComponent implements OnInit {

    // private userSubscription: Subscription;
    public routeSubscription: Subscription;
    public member$: Promise<User>;
    public team$: Promise<Team>
    public dataset$: Promise<DataSet>;
    public datasetId: string;
    public memberShortId: string;
    public memberUserId: string;
    public initiative: Initiative;
    authorities: Array<Initiative> = [];
    helps: Array<Initiative> = [];
    public isLoading: boolean;
    authoritiesHideme: Array<boolean> = [];
    helpingHideme: Array<boolean> = [];
    
    constructor(public auth: Auth, public route: ActivatedRoute, public datasetFactory: DatasetFactory, 
        public userFactory: UserFactory, public teamFactory: TeamFactory) {

        this.route.params.subscribe((params: Params) => {
            this.isLoading = true;
            this.memberShortId = params["usershortid"];
            this.datasetId = params["mapid"];
            this.member$ = this.userFactory.get(this.memberShortId).then((user: User) => {
                this.memberUserId = user.user_id;
                return user;
            })
            this.dataset$ = this.datasetFactory.get(this.datasetId)
        })
    }

    ngOnInit() {
        this.isLoading = true;
        this.routeSubscription = this.route.params.subscribe((params: Params) => {
            this.authorities = [];
            this.helps = [];
            Promise.all([this.member$, this.dataset$]).then(([user, dataset]) => {
                this.initiative = dataset.initiative;
                this.initiative.traverse(function (i: Initiative) {
                    if (i.accountable && i.accountable.user_id === this.memberUserId) {
                        if (!this.authorities.includes(i)) this.authorities.push(i)
                    }
                    if (i.helpers && i.helpers.find(h => h.user_id === this.memberUserId && i.accountable.user_id !== h.user_id)) {
                        if (!this.helps.includes(i)) this.helps.push(i)
                    }
                }.bind(this));
                return { authorities: this.authorities, helps: this.helps, dataset: dataset }
            })
                .then(authoritiesAndHelps => {
                    this.authorities = authoritiesAndHelps.authorities;
                    this.helps = authoritiesAndHelps.helps;

                    // this.authorities.forEach((i: Initiative) => {

                    //     Promise.all(
                    //         i.helpers.map(
                    //             m => Promise.all([this.auth.getUserInfo(m.user_id), this.userFactory.get(m.user_id)])
                    //                 .then(m => m, (reason) => { return Promise.reject(reason) })
                    //                 .then(([userInfo, userShortId]: [User, Helper]) => {
                    //                     userInfo.shortid = userShortId.shortid;
                    //                     return userInfo;
                    //                 })
                    //                 .catch(() => { m.isDeleted = true; return m })
                    //         )

                    //     )
                    //         .then(members => i.helpers = members)
                    // })

                    this.helps.forEach((i: Initiative) => {

                        // Promise.all(
                        //     i.helpers.map(
                        //         m => Promise.all([this.auth.getUserInfo(m.user_id), this.userFactory.get(m.user_id)])
                        //             .then(m => m, (reason) => { return Promise.reject(reason) })
                        //             .then(([userInfo, userShortId]: [User, User]) => {
                        //                 userInfo.shortid = userShortId.shortid;
                        //                 return userInfo;
                        //             })
                        //             .catch(() => { m.isDeleted = true; return m })
                        //     )

                        // )
                        //     .then(members => i.helpers = members)

                        // Promise.all([this.auth.getUserInfo(i.accountable.user_id), this.userFactory.get(i.accountable.user_id)])
                        //     .then(m => m, (reason) => { return Promise.reject(reason) })
                        //     .then(([userInfo, userShortId]: [User, User]) => {
                        //         userInfo.shortid = userShortId.shortid;
                        //         return userInfo;
                        //     })
                        //     .then(m => { i.accountable = m })

                    })

                    return authoritiesAndHelps.dataset;
                })
                .then((d: DataSet) => {
                    this.isLoading = false;
                    this.team$ = this.teamFactory.get(d.initiative.team_id)
                })
        }
        )
    }


    toggleAuthorityView(i: number) {
        this.authoritiesHideme.forEach(el => {
            el = true
        });
        this.authoritiesHideme[i] = !this.authoritiesHideme[i];
    }

    toggleHelpingView(i: number) {
        this.helpingHideme.forEach(el => {
            el = true
        });
        this.helpingHideme[i] = !this.helpingHideme[i];
    }


    ngOnDestroy() {
        if (this.routeSubscription)
            this.routeSubscription.unsubscribe()
    }
}