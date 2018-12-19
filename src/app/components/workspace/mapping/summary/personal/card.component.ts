import { Component, OnInit, Input } from '@angular/core';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { Router } from '../../../../../../../node_modules/@angular/router';
import { DataSet } from '../../../../../shared/model/dataset.data';

@Component({
    selector: 'personal-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css']
})
export class PersonalCardComponent implements OnInit {

    @Input("initiative") initiative:Initiative;
    @Input("datasetId") public datasetId: string;
    @Input("isWithLeader") isWithLeader:boolean;

    isHidden:boolean;
    constructor(private router:Router) { }

    ngOnInit(): void { }

    openInitiative(node: Initiative) {
        console.log(`/map/${this.datasetId}/${this.initiative.getSlug()}/circles?id=${node.id}`)
        this.router.navigateByUrl(`/map/${this.datasetId}/${this.initiative.getSlug()}/circles?id=${node.id}`)
    }

    getDescriptionId(){
        return `description-${this.initiative.id}`
    }
}
