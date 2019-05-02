import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Initiative } from '../../../../shared/model/initiative.data';
import { User } from '../../../../shared/model/user.data';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Tag, SelectableTag } from '../../../../shared/model/tag.data';
import { orderBy } from 'lodash';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    @Input("dataset") dataset: DataSet;
    @Input("user") user: User;
    @Input("members") members: User[];
    @Output("selectInitiative") selectInitiative = new EventEmitter<Initiative>();
    @Output("selectMembers") selectMembers = new EventEmitter<User[]>();
    @Output("selectTags") selectTags = new EventEmitter<Tag[]>();
    @Output("toggleFullHeight") toggleFullHeight = new EventEmitter<boolean>();
    @Output("openBuildingPanel") openBuildingPanel = new EventEmitter<void>();
    @Output("openTagsPanel") openTagsPanel = new EventEmitter<void>();

    mission: string;
    filteringUser: User;
    flattenNodes: Initiative[];
    tags: SelectableTag[];
    isShowAdvanced: boolean;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(localStorage.getItem("user_id"))
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if (changes.dataset && changes.dataset.currentValue) {
            let dataset = <DataSet>changes.dataset.currentValue;
            this.mission = dataset.initiative.children[0].name;
            this.tags = orderBy(dataset.tags.map((t: Tag) => { (<SelectableTag>t).isSelected = false; return <SelectableTag>t }),
                t => t.name.length,
                "desc");
            this.flattenNodes = dataset.initiative.flatten();



            this.cd.markForCheck();
        }
    }

    ngDoCheck(): void {
        // if (localStorage.getItem("user_id")) {
        //     this.filteringUser = this.members.filter(m => m.shortid === localStorage.getItem("user_id"))[0];
        //     this.cd.markForCheck();
        // }
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
        this.selectInitiative.emit(node);
    }

    onClearUserFilter() {

        localStorage.removeItem("user_id")
        this.filteringUser = null;
        this.selectMembers.emit([]);
        this.selectInitiative.emit(null);
        this.selectTags.emit([])
        this.cd.markForCheck();
    }

    filterMembers = (term: string) => {
        return term.length < 1
            ? this.members
            : this.members
                .filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email))
    }


    onSelectingUser(user: User) {
        localStorage.setItem("user_id", user.shortid)
        this.filteringUser = user;
        this.selectMembers.emit([user]);
        this.cd.markForCheck();
    }

    onSelectTag(tags: SelectableTag[]) {
        this.selectTags.emit(tags.filter(t => t.isSelected))
    }
}
