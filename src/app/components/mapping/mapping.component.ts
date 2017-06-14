import {
    Component,
    AfterViewInit,
    ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef,
    OnInit,
    ChangeDetectionStrategy, ChangeDetectorRef, ComponentRef
} from "@angular/core";

import { DataService } from "../../shared/services/data.service"
import { Views } from "../../shared/model/view.enum"
import { IDataVisualizer } from "./mapping.interface"
import { MappingCirclesComponent } from "./circles/mapping.circles.component"
import { MappingTreeComponent } from "./tree/mapping.tree.component"
import { AnchorDirective } from "../../shared/directives/anchor.directive"

import "rxjs/add/operator/map"
import { EmitterService } from "../../shared/services/emitter.service";

@Component({
    selector: "mapping",
    template: require("./mapping.component.html"),
    styles: [require("./mapping.component.css").toString()],
    entryComponents: [MappingCirclesComponent, MappingTreeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush

})


export class MappingComponent implements AfterViewInit, OnInit {

    private data: any;

    selectedView: Views = Views.Circles // per default;

    // @ViewChild("circles")
    // private circles: MappingCirclesComponent;

    // @ViewChild("tree")
    // private tree: MappingTreeComponent;

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild("drawing")
    public element: ElementRef;

    constructor(
        private dataService: DataService,
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.dataService.get().subscribe(data => {
            this.data = data;
            this.show(this.selectedView);

        });
    }

    isTreeviewSelected(): boolean {
        return this.selectedView === Views.Tree;
    }
    isCircleViewSelected(): boolean {
        return this.selectedView === Views.Circles;
    }


    switchView() {
        switch (this.selectedView) {
            case Views.Circles:
                this.selectedView = Views.Tree;
                break;
            case Views.Tree:
                this.selectedView = Views.Circles;
                break
            default:
                throw new Error("This view is not recognized");
        }
        this.show(this.selectedView);
    }

    save(){
        EmitterService.get("currentDataset").emit(this.data);
    }


    ngAfterViewInit() {
    }

    getInstance(component:ComponentRef<IDataVisualizer>):IDataVisualizer{
        return component.instance;
    }

    show(mode: Views) {
        let data = this.data;
        let factory =
            (mode === Views.Circles)
                ? this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent)
                : this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent)

        let component = this.anchorComponent.createComponent<IDataVisualizer>(factory);

        let instance = this.getInstance(component);
        instance.width = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.height = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.margin = 10;
        instance.draw(data);
    }
}