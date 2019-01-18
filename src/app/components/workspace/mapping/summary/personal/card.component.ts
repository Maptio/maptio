import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { Router } from '../../../../../../../node_modules/@angular/router';
import { DataSet } from '../../../../../shared/model/dataset.data';
import { Team } from '../../../../../shared/model/team.data';
import { User } from '../../../../../shared/model/user.data';

@Component({
    selector: 'personal-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css']
})
export class PersonalCardComponent implements OnInit {

    @Input("initiative") initiative:Initiative;
    @Input("team") team:Team;
    @Input("datasetId") public datasetId: string;
    @Input("isWithLeader") isWithLeader:boolean;
    @Output("selectMember") selectMember:EventEmitter<User> = new EventEmitter<User>();

    isShowRoles:boolean;
    constructor(private router:Router) { }

    ngOnInit(): void { }

    openInitiative(node: Initiative) {
        this.router.navigateByUrl(`/map/${this.datasetId}/${this.initiative.getSlug()}/circles?id=${node.id}`)
    }

    onSelectMember(user:User){
        this.selectMember.emit(user);
    }

    getWithDescriptionId(){
        return `with-description-${this.initiative.id}`
    }
    getNoDescriptionId(){
        return `no-description-${this.initiative.id}`
    }
    getMultipleCollapseId(){
        return `with-description-${this.initiative.id} no-description-${this.initiative.id}`
    }
    getMultipleCollapseClass(){
        return `multi-collapse-${this.initiative.id}`
   
    }
}
