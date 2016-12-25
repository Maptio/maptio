import {
    Component,
    AfterViewInit,
    ViewChild,ViewContainerRef,ComponentFactoryResolver,
    OnInit, OnChanges, SimpleChanges,
    Input
} from '@angular/core';

import { DataService } from '../services/data.service'
import { Views } from '../model/view.enum'
import {IMapping} from './mapping.interface'
import { MappingCirclesComponent } from './circles/mapping.circles.component'
import { MappingTreeComponent } from './tree/mapping.tree.component'

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/map'

@Component({
    selector: 'mapping',
    templateUrl: './mapping.component.html',
    styles: [require('./mapping.component.css').toString()],
    entryComponents:[MappingCirclesComponent, MappingTreeComponent]

})


export class MappingComponent implements OnChanges {
    private dataService: DataService;

    private data: any;

    @Input() viewMode: Views;

    @ViewChild('circles')
    private circles: MappingCirclesComponent;

    @ViewChild('tree')
    private tree: MappingTreeComponent;


    constructor(dataService: DataService, private viewContainer: ViewContainerRef,private componentFactoryResolver: ComponentFactoryResolver) {
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

         this.viewContainer.clear();

         let factory = 
            (mode == Views.Circles)
            ?  this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent)
            : this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent)

        let component = this.viewContainer.createComponent<IMapping>(factory);
        component.instance.draw(data);
       
    }
}