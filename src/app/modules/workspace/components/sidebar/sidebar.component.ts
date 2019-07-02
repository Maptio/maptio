import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Initiative } from '../../../../shared/model/initiative.data';
import { User } from '../../../../shared/model/user.data';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Tag, SelectableTag } from '../../../../shared/model/tag.data';
import { orderBy } from 'lodash';
import { EmitterService } from '../../../../core/services/emitter.service';
import { Subscription } from 'rxjs';
import { SearchResult, SearchResultType } from '../searching/search.component';
import { Team } from '../../../../shared/model/team.data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShareSlackComponent } from '../sharing/slack.component';
import { MapSettingsService, MapSettings } from '../../services/map-settings.service';
import { environment } from '../../../../config/environment';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    @Input("dataset") dataset: DataSet;
    @Input("user") user: User;
    @Input("team") team: Team;
    @Input("members") members: User[];
    @Input("isWithSearch") isWithSearch: boolean;
    @Input("panelTitle") panelTitle: string;
    @Input("isWithAdvancedSearch") isWithAdvancedSearch: boolean;
    @Output("selectInitiative") selectInitiative = new EventEmitter<Initiative>();
    @Output("selectMembers") selectMembers = new EventEmitter<User[]>();
    @Output("openMemberSummary") openMemberSummary = new EventEmitter<User>();
    @Output("selectTags") selectTags = new EventEmitter<Tag[]>();
    @Output("editTags") editTags = new EventEmitter<void>();
    @Output("toggleFullHeight") toggleFullHeight = new EventEmitter<boolean>();
    @Output("openBuildingPanel") openBuildingPanel = new EventEmitter<void>();
    @Output("openTagsPanel") openTagsPanel = new EventEmitter<void>();
    @Output("closeAllPanels") closeAllPanels = new EventEmitter<void>();
    @Output("changeColor") changeColor = new EventEmitter<string>();
    // @Output("openSlackShare") openSlackShare = new EventEmitter<void>();

    mission: string;
    isFiltersOpen: boolean = false;
    filteringUser: User;
    DEFAULT_MAP_COLOR: string = environment.DEFAULT_MAP_BACKGOUND_COLOR;
    filteringInitiative: Initiative;
    flattenNodes: Initiative[];
    filteringTagsNumber: number = 0;
    tags: SelectableTag[];
    isShowAdvanced: boolean;
    selectedResult: SearchResult;
    settings: MapSettings;

    filteringUserSubscription: Subscription;
    filteringInitiativeSubscription: Subscription;

    constructor(private cd: ChangeDetectorRef,  private settingsService: MapSettingsService) { }

    ngOnInit(): void {
        this.filteringUserSubscription = EmitterService.get("filtering_user").asObservable().subscribe(user => {

            this.filteringUser = user;
            this.cd.markForCheck()
        })

        this.filteringInitiativeSubscription = EmitterService.get("filtering_node").asObservable().subscribe(initiative => {
            this.filteringInitiative = initiative;
            this.cd.markForCheck()
        })

    }

    getSelectedResult() {
        let r = new SearchResult();
        if (this.filteringUser) {
            r.type = SearchResultType.User;
            r.result = this.filteringUser
        } else if (this.filteringInitiative) {
            r.type = SearchResultType.Initiative;
            r.result = this.filteringInitiative
        }
        else {
            return null
        }
        return r;
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.filteringUserSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dataset && changes.dataset.currentValue) {
            let dataset = <DataSet>changes.dataset.currentValue;
            this.mission = dataset.initiative.children[0] ? dataset.initiative.children[0].name : '';
            this.tags = orderBy(dataset.tags.map((t: Tag) => { (<SelectableTag>t).isSelected = false; return <SelectableTag>t }),
                t => t.name,
                "asc");
            this.flattenNodes = dataset.initiative.flatten();
            this.settings = this.settingsService.get(dataset.datasetId);
            this.cd.markForCheck();
        }
    }

    onClosePanel() {
        this.closeAllPanels.emit();
    }

    // onOpenSlackShare() {

    //     const modalRef = this.modalService.open(ShareSlackComponent, {
    //         centered: true,
    //         size: 'lg'
    //     });
    //     let component = <ShareSlackComponent>modalRef.componentInstance;
    //     component.team = this.team;
    //     component.dataset = this.dataset;
    //     component.members = this.members;
    // }

    onChangeColor(color: string) {
        this.settings.mapColor = color;
        this.settingsService.set(this.dataset.datasetId, this.settings);

        this.changeColor.emit(color);
    }

    onOpenBuildingPanel() {
        this.openBuildingPanel.emit();
    }

    onOpenTagsPanel() {
        this.openTagsPanel.emit();
    }

    onShowAdvanced() {
        this.isShowAdvanced = !this.isShowAdvanced;
        this.toggleFullHeight.emit(this.isShowAdvanced);
    }

    onSelectCircle(node: Initiative) {
        this.filteringInitiative = node;
        this.cd.markForCheck();
        this.selectInitiative.emit(node);
    }

    onOpenUserSummary(user: User) {
        this.openMemberSummary.emit(user)
    }

    onClearUserFilter() {
        EmitterService.get("filtering_user").next(null);
        localStorage.removeItem("user_id")
        // this.filteringUser = null;
        this.selectMembers.emit([]);
        this.cd.markForCheck();
    }

    filterMembers = (term: string) => {
        return term.length < 1
            ? this.members
            : this.members
                .filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email))
    }

    onClear() {

        EmitterService.get("filtering_user").next(null);
        localStorage.removeItem("user_id")
        EmitterService.get("filtering_initiative").next(null);
        localStorage.removeItem("node_id");
        this.filteringUser = null;
        this.filteringInitiative = null;
        this.tags.forEach(t => t.isSelected = false);
        this.selectMembers.emit([]);
        this.selectInitiative.emit(null);
        this.selectTags.emit([])
        this.cd.markForCheck();
    }


    onSelectMember(user: User) {
        EmitterService.get("filtering_user").next(user);
        localStorage.setItem("user_id", user.shortid)
        this.filteringUser = user;
        this.selectMembers.emit([user]);
        this.cd.markForCheck();
    }

    isSelectedUser(member: User) {
        return this.filteringUser && this.filteringUser.user_id === member.user_id;
    }

    onSelectTag(tags: SelectableTag[]) {
        let filteringTags = tags.filter(t => t.isSelected).map(t => <Tag>t) || [];
        this.selectTags.emit(filteringTags);
        this.filteringTagsNumber = filteringTags.length;
        this.cd.markForCheck();
    }

    onEditTags() {
        this.editTags.emit();
    }
}
