import {
    Component,
    AfterViewInit,
    ViewChild, ViewContainerRef, ComponentFactoryResolver,
    OnInit, OnChanges, SimpleChanges,
    Input
} from '@angular/core';

import { DataService } from '../services/data.service'
import { Views } from '../model/view.enum'
import { IDataVisualizer } from './mapping.interface'
import { MappingCirclesComponent } from './circles/mapping.circles.component'
import { MappingTreeComponent } from './tree/mapping.tree.component'
import { AnchorDirective } from '../directives/anchor.directive'

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/map'

@Component({
    selector: 'mapping',
    templateUrl: './mapping.component.html',
    styles: [require('./mapping.component.css').toString()],
    entryComponents: [MappingCirclesComponent, MappingTreeComponent]

})


export class MappingComponent implements OnChanges {
    private dataService: DataService;

    private data: any;

    @Input() viewMode: Views;

    @ViewChild('circles')
    private circles: MappingCirclesComponent;

    @ViewChild('tree')
    private tree: MappingTreeComponent;

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;



    constructor(dataService: DataService, private viewContainer: ViewContainerRef, private componentFactoryResolver: ComponentFactoryResolver) {
        dataService.getData().subscribe(data => {
            this.data = data;
            console.log("OBERVABLE DRAWS");
            this.show(this.viewMode);
        });
    }

    ngOnChanges(changes: any) {
        if (changes['viewMode'] != undefined)
            this.show(changes['viewMode'].currentValue);
    }

    show(mode: Views) { 
        let data = this.data;
        console.log(data);
        let factory =
            (mode == Views.Circles)
                ? this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent)
                : this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent)

        let component = this.anchorComponent.createComponent<IDataVisualizer>(factory);

        let width = 1000;
        let height =  1000;
        let margin = 10;
        console.log("DRAW");
        component.instance.draw(data, width, height, margin);

    }
}