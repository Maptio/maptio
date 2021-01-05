import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Observable, Subscription, Subject } from "rxjs";

import { DataService } from "../../../services/data.service";
import { Router } from "@angular/router";
import { DataSet } from "../../../../../shared/model/dataset.data";
import { Team } from "../../../../../shared/model/team.data";
import { User } from "../../../../../shared/model/user.data";
import { Permissions } from "../../../../../shared/model/permission.data";
// import { TeamFactory } from "../../../../../core/http/team/team.factory";
import { UserFactory } from "../../../../../core/http/user/user.factory";
// import { DatasetFactory } from "../../../../../core/http/map/dataset.factory";
// import { Auth } from "../../../../../core/authentication/auth.service";
import { Initiative } from "../../../../../shared/model/initiative.data";
// import { SelectableTag, Tag } from "../../../../../shared/model/tag.data";

import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { LoaderService } from "../../../../../shared/components/loading/loader.service";
import { UserService } from "../../../../../shared/services/user/user.service";

@Component({
    selector: "summary-people",
    templateUrl: "./people.component.html",
    styleUrls: ["./people.component.css"],
    host: { "class": "d-flex flex-row w-100" },
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PeopleSummaryComponent implements OnInit {
    @Output() selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();

    // public width: number;
    // public height: number;
    // public margin: number;

    // public zoom$: Observable<number>;
    // public fontSize$: Observable<number>;
    // public fontColor$: Observable<string>;
    // public mapColor$: Observable<string>;

    // public zoomInitiative$: Subject<Initiative>;
    // public selectableTags$: Observable<Array<SelectableTag>>;
    // public isReset$: Observable<boolean>;


    // public translateX: number;
    // public translateY: number;
    // public scale: number;
    // public tagsState: Array<SelectableTag>;

    // public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
    // public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
    // public showContextMenuOf$: Subject<{
    //     initiatives: Initiative[], x: Number, y: Number,
    //     isReadOnlyContextMenu: boolean
    // }> = new Subject<{
    //     initiatives: Initiative[], x: Number, y: Number,
    //     isReadOnlyContextMenu: boolean
    // }>();

    members: User[];
    filteredMembers: User[];
    initiative: Initiative;
    team: Team;
    // datasetId: string;
    dataset: DataSet;
    selectedMember: User;
    dataSubscription: Subscription;
    filterMembers$: Subject<string> = new Subject<string>();
    isOthersPeopleVisible: boolean;
    Permissions = Permissions;

    constructor(
        // public auth: Auth,
        public route: ActivatedRoute,
        // public datasetFactory: DatasetFactory,
        public userFactory: UserFactory,
        private userService: UserService,
        // jpublic teamFactory: TeamFactory,
        private dataService: DataService,
        public loaderService: LoaderService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private analytics: Angulartics2Mixpanel, 
    ) {}

    ngOnInit(): void {
        this.loaderService.show();
        // this.init();
        this.dataSubscription = this.dataService
            .get()
            .combineLatest(this.route.queryParams)
            .switchMap((data: [any, Params]) => {
                console.log(data)
                if (data[1].member) {
                    return this.userFactory.get(data[1].member)
                        .then(user => this.userService.getUsersInfo([user]))
                        .then((users: User[]) => {
                            console.log(users)
                            this.selectedMember = users[0];
                            this.cd.markForCheck();
                            return data[0];
                        });
                } else {
                    this.selectedMember = null;
                    this.cd.markForCheck();
                    return Observable.of(data[0])
                }
            })
            .subscribe((data: any) => {
                this.members = data.members;
                console.log(this.members)
                this.initiative = data.initiative;
                this.dataset = data.dataset;
                // this.datasetId = data.dataset.datasetId;
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
        // this.selectableTags$.subscribe(tags => this.tagsState = tags);

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

    // This isn't used anywhere and so likely can be deleted
    // showSummary(member: User) {
    //     this.selectedMember = member;
    //     this.cd.markForCheck();
    // }

    onKeyDown(search: string) {
        this.filterMembers$.next(search);
    }

    onAddingNewMember(){
        this.router.navigateByUrl(`/teams/${this.team.team_id}/people`)
    }

    onSelectMember(user: User) {
        this.selectedMember = user;
        this.cd.markForCheck();
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { member: user.shortid }
        })
    }

    onSelectInitiative(initiative: Initiative){
        this.selectInitiative.emit(initiative);
    }

    // init(): void {
    //     // throw new Error("Method not implemented.");
    // }
}
