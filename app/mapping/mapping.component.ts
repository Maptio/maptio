import {
    Component,
    AfterViewInit,
    ViewChild,
    OnInit, OnChanges, SimpleChanges,
    Input
} from '@angular/core';

import { DataService } from '../services/data.service'
import { Views } from '../model/view.enum'
import { MappingCirclesComponent } from './circles/mapping.circles.component'
import { MappingTreeComponent } from './tree/mapping.tree.component'

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/map'

@Component({
    selector: 'mapping',
    templateUrl: './mapping.component.html',
    styles: [require('./mapping.component.css').toString()],

})


export class MappingComponent implements OnChanges {
    private dataService: DataService;

    private data: any;

    @Input() viewMode: Views;

    @ViewChild('circles')
    private circles: MappingCirclesComponent;

    @ViewChild('tree')
    private tree: MappingTreeComponent;


    constructor(dataService: DataService) {
        dataService.getData().subscribe(data => {
            this.data = data;
            this.show(this.viewMode);
        });

    }

    ngOnChanges(changes: any) {
        console.log("CHANGE")
        this.show(changes['viewMode'].currentValue);
    }
    

    show(mode: Views) {
        console.log("SHOW " + mode);
        let data = this.data;

        switch (mode) {
            case Views.Circles:
                this.circles.draw(data);
                break;
            case Views.Treeview:
                this.tree.draw(data);
                break;
            default:
                throw new Error("This view is not recognized")

        }
    }
}