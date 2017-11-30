import { TeamFactory } from "./../../../shared/services/team.factory";
import { UserFactory } from "./../../../shared/services/user.factory";
import { DataSet } from "./../../../shared/model/dataset.data";
import { ActivatedRoute, Params } from "@angular/router";
import { DatasetFactory } from "./../../../shared/services/dataset.factory";
import { User } from "./../../../shared/model/user.data";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Observable, Subscription } from "rxjs/Rx";
import { IDataVisualizer } from "./../mapping.interface";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Team } from "../../../shared/model/team.data";
import { Subject } from "rxjs/Rx";
import { Angulartics2Mixpanel } from "angulartics2";
import { DataService } from "../../../shared/services/data.service";

@Component({
    selector: "member-summary",
    templateUrl: "./member-summary.component.html",
    styleUrls: ["./member-summary.component.css"]
})

export class MemberSummaryComponent implements OnInit, IDataVisualizer {

    public width: number;
    public height: number;
    public margin: number;
    public teamName: string;
    public teamId: string;
    public translateX: number;
    public translateY: number;
    public scale: number;
    public zoom$: Observable<number>
    public fontSize$: Observable<number>;
    public isLocked$: Observable<boolean>;
    public isReset$: Observable<boolean>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;
    public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>()
    public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }> = new Subject<{ node: Initiative, from: Initiative, to: Initiative }>();
    public closeEditingPanel$: Subject<boolean> = new Subject<boolean>();
    public analytics: Angulartics2Mixpanel;

    // private userSubscription: Subscription;
    public subscription: Subscription;
    public member: User;
    public team: Team
    public dataset$: Promise<DataSet>;
    public datasetId: string;
    public datasetSlug: string;
    public memberShortId: string;
    public memberUserId: string;
    public initiative: Initiative;
    authorities: Array<Initiative> = [];
    helps: Array<Initiative> = [];
    public isLoading: boolean;
    authoritiesHideme: Array<boolean> = [];
    helpingHideme: Array<boolean> = [];


    constructor(public auth: Auth, public route: ActivatedRoute, public datasetFactory: DatasetFactory,
        public userFactory: UserFactory, public teamFactory: TeamFactory, private dataService: DataService,
        private cd: ChangeDetectorRef) {
    }


    init() {

    }

    openInitiative(node: Initiative) {
        this.showDetailsOf$.next(node);
    }

    ngOnInit() {
        this.isLoading = true;
        this.subscription = this.dataService.get()
            .map(data => {
                this.datasetId = data.datasetId;
                this.analytics.eventTrack("Map", { view: "personal", team: data.teamName, teamId: data.teamId });
                this.initiative = data.initiative;
            })
            .combineLatest(this.route.params)
            .map(([, params]: [void, Params]) => {
                this.memberShortId = params["usershortid"];
                return this.memberShortId;
            })
            .switchMap((memberShortId: string) => {

                return this.userFactory.get(memberShortId)
                    .then((user: User) => {
                        this.memberUserId = user.user_id;
                        this.member = user;
                        return user;
                    });

            })
            .subscribe((user: User) => {
                this.authorities = [];
                this.helps = [];

                this.initiative.traverse(function (i: Initiative) {
                    if (i.accountable && i.accountable.user_id === this.memberUserId) {
                        if (!this.authorities.includes(i)) this.authorities.push(i)
                    }
                    if (i.helpers && i.helpers.find(h => h.user_id === this.memberUserId && i.accountable && i.accountable.user_id !== h.user_id)) {
                        if (!this.helps.includes(i)) this.helps.push(i)
                    }
                }.bind(this));
                this.cd.markForCheck();
                this.isLoading = false;
            })
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
        if (this.subscription)
            this.subscription.unsubscribe()
    }
}