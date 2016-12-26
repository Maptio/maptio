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

    private isFullScreen: boolean = false;

    @Input() viewMode: Views;

    @ViewChild('circles')
    private circles: MappingCirclesComponent;

    @ViewChild('tree')
    private tree: MappingTreeComponent;

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;



    constructor(dataService: DataService, private viewContainer: ViewContainerRef, private componentFactoryResolver: ComponentFactoryResolver) {
        dataService.getData().subscribe(data => {
            this.data = data;
            this.show(this.viewMode, 840, 840, 50);
        });
    }

    ngOnChanges(changes: any) {
        console.log("CHANGES" + this.isFullScreen)
        if (this.isFullScreen) {
            this.show(changes['viewMode'].currentValue, 1000, 1000, 50);
        }
        else {
            this.show(changes['viewMode'].currentValue, 840, 840, 50);
        }
    }

    toggleFullScreen(event: any) {
        this.isFullScreen = event.target.checked;
        if (this.isFullScreen) {
            this.show(this.viewMode, 1000, 1000, 50);
        }
        else {
            this.show(this.viewMode, 840, 840, 50);
        }
    }

    show(mode: Views, width: number, height: number, margin: number) {
        console.log("SHOW " + mode);
        let data = this.data;

        let factory =
            (mode == Views.Circles)
                ? this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent)
                : this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent)
    
        let component = this.anchorComponent.createComponent<IDataVisualizer>(factory); 
        component.instance.draw(data, width, height, margin);

    }
}