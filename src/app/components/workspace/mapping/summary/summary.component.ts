import { DataService } from "../../../../shared/services/data.service";
import { Params, ActivatedRouteSnapshot } from "@angular/router";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";
import { UIService } from "../../../../shared/services/ui/ui.service";
import { TeamFactory } from "../../../../shared/services/team.factory";
import { UserFactory } from "../../../../shared/services/user.factory";
import { DatasetFactory } from "../../../../shared/services/dataset.factory";
import { ActivatedRoute } from "@angular/router";
import { Auth } from "../../../../shared/services/auth/auth.service";
import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableTag, Tag } from "../../../../shared/model/tag.data";

import { Observable, Subscription } from "rxjs";
import { IDataVisualizer } from "../mapping.interface";
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { Subject } from "rxjs";
import { Angulartics2Mixpanel } from "angulartics2";
import { partition } from "lodash";
import { LoaderService } from "../../../../shared/services/loading/loader.service";

@Component({
    selector: "summary",
    templateUrl: "./summary.component.html",
    styleUrls: ["./summary.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MappingSummaryComponent implements OnInit, IDataVisualizer {

    public teamName: string;
    public teamId: string;
    public datasetId: string;

    public width: number;
    public height: number;
    public margin: number;

    public zoom$: Observable<number>;
    public fontSize$: Observable<number>;
    public fontColor$: Observable<string>;
    public mapColor$: Observable<string>;

    public zoomInitiative$: Observable<Initiative>;
    public selectableTags$: Observable<Array<SelectableTag>>;
    public toggleOptions$: Observable<Boolean>;
    public isReset$: Observable<boolean>;


    public translateX: number;
    public translateY: number;
    public scale: number;
    public tagsState: Array<SelectableTag>;

    public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
    public showContextMenuOf$: Subject<{
        initiatives: Initiative[], x: Number, y: Number,
        isReadOnlyContextMenu: boolean
    }> = new Subject<{
        initiatives: Initiative[], x: Number, y: Number,
        isReadOnlyContextMenu: boolean
    }>();
    public moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }> = new Subject<{ node: Initiative, from: Initiative, to: Initiative }>();
    public closeEditingPanel$: Subject<boolean> = new Subject<boolean>();
    public analytics: Angulartics2Mixpanel;

    members: User[];
    initiative: Initiative;
    team: Team;
    selectedMember: User;
    dataSubscription: Subscription;

    constructor(public auth: Auth, public route: ActivatedRoute, public datasetFactory: DatasetFactory,
        public userFactory: UserFactory, public teamFactory: TeamFactory, private dataService: DataService,
        public loaderService: LoaderService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.loaderService.show();
        this.init();
        console.log(this.route.snapshot)
        this.dataSubscription = this.dataService
            .get()
            .combineLatest(this.route.queryParams)
            .switchMap((data: [any, Params]) => {
                console.log(data[1].member)
                if (data[1].member)
                    return this.userFactory.get(data[1].member)
                        .then((user: User) => {
                            this.selectedMember = user;
                            this.cd.markForCheck();
                            return data[0];
                        });
                else {
                    this.selectedMember = null;
                    this.cd.markForCheck();
                    return Observable.of(data[0])

                }
            })
            .subscribe((data: any) => {
                this.members = data.members;
                this.initiative = data.initiative;
                this.team = data.team;
                this.loaderService.hide();
                this.analytics.eventTrack("Map", {
                    action: "viewing",
                    view: "summary",
                    team: (<Team>data.team).name,
                    teamId: (<Team>data.team).team_id
                });
                this.cd.markForCheck();
            });
        this.selectableTags$.subscribe(tags => this.tagsState = tags)
    }

    ngOnDestroy(): void {
        if (this.dataSubscription) this.dataSubscription.unsubscribe();

    }

    showSummary(member: User) {
        this.selectedMember = member;
        this.cd.markForCheck();
    }

    openInitiative(node: Initiative) {
        this.showDetailsOf$.next(node);
    }

    init(): void {
        // throw new Error("Method not implemented.");
    }
}