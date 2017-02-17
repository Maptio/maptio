import {
    Component,
    AfterViewInit,
    ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef,
    OnInit,
    ChangeDetectionStrategy, ChangeDetectorRef
} from "@angular/core";

import { DataService } from "../../services/data.service"
import { Views } from "../../model/view.enum"
import { IDataVisualizer } from "./mapping.interface"
import { MappingCirclesComponent } from "./circles/mapping.circles.component"
import { MappingTreeComponent } from "./tree/mapping.tree.component"
import { AnchorDirective } from "../../directives/anchor.directive"

import "rxjs/add/operator/map"

@Component({
    selector: "mapping",
    templateUrl: "./mapping.component.html",
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
        this.dataService.getAsync().subscribe(data => {
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


    ngAfterViewInit() {
    }

    show(mode: Views) {
        let data = this.data;
        let factory =
            (mode === Views.Circles)
                ? this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent)
                : this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent)

        let component = this.anchorComponent.createComponent<IDataVisualizer>(factory);

        component.instance.width = 1522; //this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        component.instance.height = 1522; //this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        component.instance.margin = 10;
        component.instance.draw(data);
    }
}