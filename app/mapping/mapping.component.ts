import {
    Component,
    AfterViewInit,
    ViewChild, ViewContainerRef, ComponentFactoryResolver,ElementRef,
    OnInit, OnChanges, SimpleChanges,
    Input,
    ChangeDetectionStrategy,ChangeDetectorRef
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
    entryComponents: [MappingCirclesComponent, MappingTreeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush

})


export class MappingComponent implements OnChanges, AfterViewInit, OnInit {

    private data: any;

    @Input() viewMode: Views;

    @ViewChild('circles')
    private circles: MappingCirclesComponent;

    @ViewChild('tree')
    private tree: MappingTreeComponent;

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild('drawing')
    public element:ElementRef;

    constructor(
        private dataService: DataService, 
        private viewContainer: ViewContainerRef, 
        private componentFactoryResolver: ComponentFactoryResolver,
        private cd: ChangeDetectorRef
        ) {}

    ngOnInit(){
        this.dataService.getData().subscribe(data => {
            this.data = data;
            this.show(this.viewMode);
            
        });
    }

    ngAfterViewInit(){
        console.log("SIZE " + this.element.nativeElement.parentNode.parentNode.offsetHeight);
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
        
        component.instance.width = this.element.nativeElement.parentNode.parentNode.offsetHeight;
        component.instance.height = this.element.nativeElement.parentNode.parentNode.offsetHeight;
        component.instance.margin = 10;
        // let width = 
        // let height =  this.element.nativeElement.parentNode.parentNode.offsetHeight;
        // let margin = 25;
        console.log("DRAW");
        component.instance.draw(data);

    }
}