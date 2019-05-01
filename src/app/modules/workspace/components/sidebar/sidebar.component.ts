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

    mission: string;
    filteringUser: User;
    flattenNodes: Initiative[];
    tags: SelectableTag[];
    isShowAdvanced:boolean;

    constructor(private cd:ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
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

    onShowAdvanced(){
        this.isShowAdvanced = !this.isShowAdvanced;
        this.toggleFullHeight.emit(this.isShowAdvanced);
    }

    onSelectCircle(node: Initiative) {
        this.selectInitiative.emit(node);
    }

    onClearUserFilter() {
        this.filteringUser = null;
        this.selectMembers.emit([]);
        this.cd.markForCheck();
        // this.selectableUsers$.next([]);
    }

    filterMembers = (term: string) => {
        return term.length < 1
            ? this.members
            : this.members
                .filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email))
    }


    onSelectingUser(user: User) {
        this.filteringUser = user;
        this.selectMembers.emit([user]);
        this.cd.markForCheck();
        // this.selectableUsers$.next([user]);
        // this.showToolipOf$.next({ initiatives: null, user: user });
    }

    onSelectTag(tags: SelectableTag[]) {
        console.log(tags, tags.filter(t => t.isSelected))
        // this.selectableTags$.next(tags.filter(t => t.isSelected))
        this.selectTags.emit(tags.filter(t => t.isSelected))
    }
}
