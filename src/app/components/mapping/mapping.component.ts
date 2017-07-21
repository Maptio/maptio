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
import { Subject } from "rxjs/Rx";

@Component({
    selector: "mapping",
    template: require("./mapping.component.html"),
    styleUrls: ["./mapping.component.css"],
    entryComponents: [MappingCirclesComponent, MappingTreeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush

})


export class MappingComponent implements OnInit {

    PLACEMENT:string="left"
    TOGGLE:string="tooltip"
    TOOLTIP_PEOPLE_VIEW:string= "People";
    TOOLTIP_INITIATIVES_VIEW:string = "Initiatives"

    private data: any;

    selectedView: number = 0; // Views.Circles // per default;

    public zoom$: Subject<number>

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild("drawing")
    public element: ElementRef;

    constructor(
        private dataService: DataService,
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private cd: ChangeDetectorRef
    ) {

        this.zoom$ = new Subject<number>();
    }

    ngOnInit() {
        this.dataService.get().subscribe(data => {
            this.data = data;
            this.show(this.selectedView);

        });
    }

    isTreeviewSelected(): boolean {
        return this.selectedView === 1 // Views.Tree;
    }
    isCircleViewSelected(): boolean {
        return this.selectedView === 0 // Views.Circles;
    }

    switchView() {
        switch (this.selectedView) {
            case 0: // Views.Circles:
                this.selectedView = 1;
                break;
            case 1: // Views.Tree:
                this.selectedView = 0;
                break
            default:
                throw new Error("This view is not recognized");
        }
        this.show(this.selectedView);
    }

    // // save() {
    // //     EmitterService.get("currentInitiative").emit(this.data);
    // // }


    // // ngAfterViewInit() {
    // // }

    getInstance(component: ComponentRef<IDataVisualizer>): IDataVisualizer {
        return component.instance;
    }

    show(mode: Views, zoom?: number) {
        let data = this.data;
        let factory =
            (mode === 0)
                ? this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent)
                : this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent)

        let component = this.anchorComponent.createComponent<IDataVisualizer>(factory);

        let instance = this.getInstance(component);
        instance.width = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.height = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.margin = 50;
        instance.zoom$ = this.zoom$.asObservable();
        instance.draw(data);
    }


    zoomOut() {
        this.zoom$.next(0.9);
    }

    zoomIn() {
        this.zoom$.next(1.1);
    }

    resetZoom() {
        this.zoom$.next(null);
    }
}