import { DataService } from "../../services/data.service";
import { Params, ActivatedRouteSnapshot, Router } from "@angular/router";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";
import { UIService } from "../../services/ui.service";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { ActivatedRoute } from "@angular/router";
import { Auth } from "../../../../core/authentication/auth.service";
import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableTag, Tag } from "../../../../shared/model/tag.data";

import { Observable, Subscription } from "rxjs";
import { IDataVisualizer } from "../../components/canvas/mapping.interface";
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { Subject } from "rxjs";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { UserService } from "../../../../shared/services/user/user.service";

@Component({
    selector: "summary",
    templateUrl: "./summary.component.html",
    styleUrls: ["./summary.component.css"],
    host: { "class": "w-100" },
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MappingSummaryComponent implements OnInit, IDataVisualizer {

    public datasetId: string;

    public width: number;
    public height: number;
    public margin: number;

    public zoom$: Observable<number>;
    public fontSize$: Observable<number>;
    public fontColor$: Observable<string>;
    public mapColor$: Observable<string>;

    public zoomInitiative$: Subject<Initiative>;
    public selectableTags$: Observable<Array<SelectableTag>>;
    public isReset$: Observable<boolean>;


    public translateX: number;
    public translateY: number;
    public scale: number;
    public tagsState: Array<SelectableTag>;

    public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
    public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
    public showContextMenuOf$: Subject<{
        initiatives: Initiative[], x: Number, y: Number,
        isReadOnlyContextMenu: boolean
    }> = new Subject<{
        initiatives: Initiative[], x: Number, y: Number,
        isReadOnlyContextMenu: boolean
    }>();
    public analytics: Angulartics2Mixpanel;

    members: User[];
    filteredMembers: User[];
    initiative: Initiative;
    team: Team;
    dataset: DataSet;
    selectedMember: User;
    dataSubscription: Subscription;
    filterMembers$: Subject<string> = new Subject<string>();
    isOthersPeopleVisible: boolean;

    constructor(public auth: Auth, public route: ActivatedRoute, public datasetFactory: DatasetFactory,
        public userFactory: UserFactory, private userService: UserService, public teamFactory: TeamFactory, private dataService: DataService,
        public loaderService: LoaderService, private router: Router,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.loaderService.show();
        this.init();
        this.dataSubscription = this.dataService
            .get()
            .combineLatest(this.route.queryParams)
            .switchMap((data: [any, Params]) => {
                console.log(data)
                if (data[1].member)
                    return this.userFactory.get(data[1].member)
                        .then(user => this.userService.getUsersInfo([user]))
                        .then((users: User[]) => {
                            console.log(users)
                            this.selectedMember = users[0];
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
                this.dataset = data.dataset;
                this.datasetId = data.dataset.datasetId;
                this.team = data.team;
                this.loaderService.hide();
                this.analytics.eventTrack("Map", {
                    action: "viewing",
                    view: "summary",
                    team: (<Team>data.team).name,
                    teamId: (<Team>data.team).team_id
                });
                this.filteredMembers = [].concat(this.members);
                this.cd.markForCheck();
            });
        this.selectableTags$.subscribe(tags => this.tagsState = tags);

        this.filterMembers$.asObservable().debounceTime(250).subscribe((search) => {
            this.filteredMembers = (search === '')
                ? [].concat(this.members)
                : this.members.filter(m => m.name.toLowerCase().indexOf(search.toLowerCase()) >= 0);
            this.cd.markForCheck();
        })

    }

    ngOnDestroy(): void {
        if (this.dataSubscription) this.dataSubscription.unsubscribe();

    }

    showSummary(member: User) {
        this.selectedMember = member;
        this.cd.markForCheck();
    }

    onKeyDown(search: string) {
        this.filterMembers$.next(search);
    }

    onSelectMember(user: User) {
        this.selectedMember = user;
        this.cd.markForCheck();
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { member: user.shortid }
        })
    }

    onSelectInitiative(initiative: Initiative) {
        localStorage.setItem("node_id", initiative.id.toString());
                
        this.router.navigateByUrl(`/map/${this.dataset.datasetId}/${this.initiative.getSlug()}/circles`)
            .then(() => {
            })
    }

    init(): void {
        // throw new Error("Method not implemented.");
    }
}