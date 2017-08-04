import { ActivatedRoute, Params } from "@angular/router";
import {
    Component,
    AfterViewInit,
    ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef,
    OnInit,
    ChangeDetectionStrategy, ChangeDetectorRef, ComponentRef, ComponentFactory
} from "@angular/core";

import { DataService } from "../../shared/services/data.service"
import { Views } from "../../shared/model/view.enum"
import { IDataVisualizer } from "./mapping.interface"
import { MappingCirclesComponent } from "./circles/mapping.circles.component"
import { MappingTreeComponent } from "./tree/mapping.tree.component"
import { AnchorDirective } from "../../shared/directives/anchor.directive"

import "rxjs/add/operator/map"
import { EmitterService } from "../../shared/services/emitter.service";
import { Subject, BehaviorSubject, Subscription } from "rxjs/Rx";

@Component({
    selector: "mapping",
    template: require("./mapping.component.html"),
    styleUrls: ["./mapping.component.css"],
    entryComponents: [MappingCirclesComponent, MappingTreeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush

})


export class MappingComponent implements OnInit {

    PLACEMENT: string = "left"
    TOGGLE: string = "tooltip"
    TOOLTIP_PEOPLE_VIEW: string = "People view";
    TOOLTIP_INITIATIVES_VIEW: string = "Initiatives view";
    TOOLTIP_ZOOM_IN: string = "Zoom in";
    TOOLTIP_ZOOM_OUT: string = "Zoom out";
    TOOLTIP_ZOOM_FIT: string = "Zoom fit";

    private data: any;

    // selectedView: number = 0; // Views.Circles // per default;

    public zoom$: Subject<number>

    public fontSize$: BehaviorSubject<number>

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild("drawing")
    public element: ElementRef;

    public componentFactory: ComponentFactory<IDataVisualizer>;
    public layout: string;
    // public isCircles: boolean;
    // public isTree: boolean;
    public subscription: Subscription;

    constructor(
        private dataService: DataService,
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute
    ) {

        this.zoom$ = new Subject<number>();
        this.fontSize$ = new BehaviorSubject<number>(12);

        this.subscription = this.route.params.subscribe((params: Params) => {
            this.layout = params["layout"]
            this.cd.markForCheck();
        })
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params: Params) => {
             console.log(params["layout"]);
            this.layout = params["layout"]

            switch (this.layout) {
                case "initiatives": // Views.Circles:
                    this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent)
                    break;
                case "people": // Views.Tree:
                    this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent)
                    break
                default:
                    throw new Error("This view is not recognized");
            }
        })

        this.dataService.get().subscribe(data => {
            this.data = data;
            this.show();

        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getInstance(component: ComponentRef<IDataVisualizer>): IDataVisualizer {
        return component.instance;
    }

    show() {
        let data = this.data;

        let component = this.anchorComponent.createComponent<IDataVisualizer>(this.componentFactory);

        let instance = this.getInstance(component);
        instance.width = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.height = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.margin = 50;
        instance.zoom$ = this.zoom$.asObservable();
        instance.fontSize$ = this.fontSize$.asObservable();
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

    changeFontSize(size: number) {
        this.fontSize$.next(size);
    }
}