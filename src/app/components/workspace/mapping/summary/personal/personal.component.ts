import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { User } from "../../../../../shared/model/user.data";
// import { Tag, SelectableTag } from "../../../../../shared/model/tag.data";
import { Team } from "../../../../../shared/model/team.data";
// import { partition } from "lodash";


@Component({
    selector: "summary-personal",
    templateUrl: "./personal.component.html",
    styleUrls: ["./personal.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PersonalSummaryComponent implements OnInit {

    authorities: Array<Initiative> = [];
    helps: Array<Initiative> = [];
    public isLoading: boolean;
    authoritiesHideme: Array<boolean> = [];
    helpingHideme: Array<boolean> = [];
    initiativesMap: Map<number, boolean> = new Map<number, boolean>();

    @Input("member") public member: User;
    @Input("initiative") public initiative: Initiative;
    @Input("team") public team: Team;
    @Input("height") public height: number;
    @Input("datasetId") public datasetId: string;
    // @Input("tags") public tags: SelectableTag[];

    @Output() edit: EventEmitter<Initiative> = new EventEmitter<Initiative>();

    private _user: User;
    private _initiative: Initiative;
    private _team: Team;
    // private _selectedTags: SelectableTag[];
    // private _unselectedTags: SelectableTag[];

    constructor(private cd: ChangeDetectorRef) {

    }

    ngOnInit() {
        if (this._user && this._initiative && this._team) {
            this.getSummary();
            this.cd.markForCheck();

        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.member && changes.member.currentValue) {
            this._user = changes.member.currentValue;
        }
        if (changes.initiative && changes.initiative.currentValue) {
            this._initiative = changes.initiative.currentValue;
        }
        if (changes.team && changes.team.currentValue) {
            this._team = changes.team.currentValue;
        }
        // if(changes.tags && changes.tags.currentValue){
        //     let [s, u] = partition(<SelectableTag[]>changes.tags.currentValue, t => t.isSelected)
        //     this._selectedTags = s;
        //     this._unselectedTags = u;
        // }
        this.ngOnInit();
    }

    getSummary() {
        this.authorities = [];
        this.helps = [];
        // let [selectedTags, unselectedTags] = partition(tags, t => t.isSelected);

        this._initiative.traverse(function (i: Initiative) {
            if (i.accountable && i.accountable.user_id === this._user.user_id) {
                if (!this.authorities.includes(i)) this.authorities.push(i)
            }
            if (i.helpers && i.helpers.find(h => h.user_id === this._user.user_id && i.accountable && i.accountable.user_id !== h.user_id)) {
                if (!this.helps.includes(i)) this.helps.push(i)
            }

            // let nodeTags = i.tags.map((t: Tag) => t.shortid);
            // this.initiativesMap.set(i.id,
            //     this.uiService.filter(selectedTags, unselectedTags, nodeTags)
            // );

        }.bind(this));
    }


    openInitiative(node: Initiative) {
        this.edit.emit(node);
    }

    // ngOnInit() {
    //     this.isLoading = true;
    //     this.subscription =
    //         this.dataService.get()
    //             .map(data => {
    //                 this.datasetId = data.datasetId;
    //                 this.analytics.eventTrack("Map", { 
    //                     action: "viewing", 
    //                     view: "personal", 
    //                     team: data.team.name, 
    //                     teamId: data.team.team_id });
    //                 this.initiative = data.initiative;
    //                 this.team = data.team;
    //             })
    //             .combineLatest(this.route.params)

    //         this.route.params.map((params: Params) => {
    //             console.log(params)
    //             this.memberShortId = params["usershortid"];
    //             return this.memberShortId;
    //         })
    //             .switchMap((memberShortId: string) => {
    //                 return this.userFactory.get(memberShortId)
    //                     .then((user: User) => {
    //                         this.memberUserId = user.user_id;
    //                         this.member = user;
    //                         return user;
    //                     });
    //             })
    //             // .combineLatest(this.selectableTags$)
    //             .subscribe((user: User) => {
    //                 this.authorities = [];
    //                 this.helps = [];
    //                 // let [selectedTags, unselectedTags] = partition(tags, t => t.isSelected);

    //                 this.initiative.traverse(function (i: Initiative) {
    //                     if (i.accountable && i.accountable.user_id === this.memberUserId) {
    //                         if (!this.authorities.includes(i)) this.authorities.push(i)
    //                     }
    //                     if (i.helpers && i.helpers.find(h => h.user_id === this.memberUserId && i.accountable && i.accountable.user_id !== h.user_id)) {
    //                         if (!this.helps.includes(i)) this.helps.push(i)
    //                     }

    //                     let nodeTags = i.tags.map((t: Tag) => t.shortid);
    //                     // this.initiativesMap.set(i.id,
    //                     //     this.uiService.filter(selectedTags, unselectedTags, nodeTags)
    //                     // );

    //                 }.bind(this));
    //                 this.cd.markForCheck();
    //                 this.isLoading = false;
    //             })
    // }

    // isInitiativeSelected(id: number): boolean {
    //     return this.initiativesMap.get(id);
    // }

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
    }
}