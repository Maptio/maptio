import { Initiative } from "./../../shared/model/initiative.data";
// import { MappingNetworkComponent } from "./network/mapping.network.component";
import { Angulartics2Mixpanel } from "angulartics2";

import { ActivatedRoute, Params, UrlSegment } from "@angular/router";
import {
    Component,
    AfterViewInit, EventEmitter,
    ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef,
    OnInit,
    ChangeDetectionStrategy, ChangeDetectorRef, ComponentRef, ComponentFactory, Input, Output
} from "@angular/core";

import { DataService } from "../../shared/services/data.service"
import { Views } from "../../shared/model/view.enum"
import { IDataVisualizer } from "./mapping.interface"
import { MappingCirclesComponent } from "./circles/mapping.circles.component"
import { MappingTreeComponent } from "./tree/mapping.tree.component"
import { AnchorDirective } from "../../shared/directives/anchor.directive"

import "rxjs/add/operator/map"
import { EmitterService } from "../../shared/services/emitter.service";
import { Subject, BehaviorSubject, Subscription, Observable } from "rxjs/Rx";

@Component({
    selector: "mapping",
    templateUrl: "./mapping.component.html",
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

    public data: { initiative: Initiative, datasetId: string };
    public x: number;
    public y: number;
    public scale: number;

    public isCollapsed: boolean = true;

    public zoom$: Subject<number>;
    private VIEWPORT_WIDTH: number = 1522;
    private VIEWPORT_HEIGHT: number = 1522;

    public isLoading: Subject<boolean>;

    public fontSize$: BehaviorSubject<number>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;

    @Output("showDetails") showDetails = new EventEmitter<Initiative>();
    @Output("addInitiative") addInitiative = new EventEmitter<Initiative>();
    @Output("removeInitiative") removeInitiative = new EventEmitter<Initiative>();

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild("drawing")
    public element: ElementRef;

    public componentFactory: ComponentFactory<IDataVisualizer>;
    public layout: string;
    public subscription: Subscription;

    constructor(
        private dataService: DataService,
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private analytics: Angulartics2Mixpanel
    ) {
        this.zoom$ = new Subject<number>();
        this.fontSize$ = new BehaviorSubject<number>(14);
        this.isLoading = new BehaviorSubject<boolean>(true);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
        this.isLoading.next(true);


        this.subscription =
            Observable
                .combineLatest(this.route.params.distinct(), this.dataService.get())
                .withLatestFrom(this.route.fragment)
                .subscribe((value: [[Params, any], string]) => {
                    this.isLoading.next(true);
                    let layout = value[0][0]["layout"];
                    this.data = value[0][1];

                    this.componentFactory = this.getComponentFactory(layout);
                    let fragment = value[1] || this.getFragment(layout);
                    this.x = Number.parseFloat(fragment.split("&")[0].replace("x=", ""))
                    this.y = Number.parseFloat(fragment.split("&")[1].replace("y=", ""))
                    this.scale = Number.parseFloat(fragment.split("&")[2].replace("scale=", ""));

                    this.layout = layout;
                    this.data$.next(value[0][1])
                    this.isLoading.next(false);
                });

        this.data$.asObservable().subscribe(data => {
            console.log("Create component")
            let component = this.anchorComponent.createComponent<IDataVisualizer>(this.componentFactory);
            let instance = this.getInstance(component);
            this.setup(instance);
            console.log("seding ", data)
            instance.draw();
            instance.data$.next(data);


            // this.show(data, this.x, this.y, this.scale);
        });


    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getFragment(layout: string) {
        switch (layout) {
            case "initiatives":
                return `x=${this.VIEWPORT_WIDTH / 2}&y=${this.VIEWPORT_HEIGHT / 2}&scale=1`
            case "people":
                return `x=100&y=0&scale=1`
            default:
                return `x=${this.VIEWPORT_WIDTH / 2}&y=${this.VIEWPORT_HEIGHT / 2}&scale=1`
        }
    }

    getComponentFactory(layout: string) {
        switch (layout) {
            case "initiatives":
                return this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent);
            case "people":
                return this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent);
            // case "network":
            //     return this.componentFactoryResolver.resolveComponentFactory(MappingNetworkComponent);
            default:
                return this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent);
        }
    }

    getInstance(component: ComponentRef<IDataVisualizer>): IDataVisualizer {
        return component.instance;
    }

    setup(instance: IDataVisualizer) {
        // let component = this.anchorComponent.createComponent<IDataVisualizer>(this.componentFactory);

        // let instance = this.getInstance(component);
        instance.showDetailsOf$.asObservable().subscribe(node => {
            this.showDetails.emit(node)
        })
        instance.addInitiative$.asObservable().subscribe(node => {
            console.log("mapping.component.ts", "adding initiative under", node.name)
            this.addInitiative.emit(node)
        })
        instance.removeInitiative$.asObservable().subscribe(node => {
            console.log("mapping.component.ts", "remove initiative", node.name)
            this.removeInitiative.emit(node)
        })
        instance.width = this.VIEWPORT_WIDTH;
        instance.height = this.VIEWPORT_HEIGHT;

        instance.margin = 50;
        // instance.datasetId = data.datasetId;
        instance.zoom$ = this.zoom$.asObservable();
        instance.fontSize$ = this.fontSize$.asObservable();
        instance.translateX = this.x;
        instance.translateY = this.y;
        instance.scale = this.scale;

        // instance.data$

        // instance.draw(data.initiative, x, y, scale);
    }


    zoomOut() {
        this.zoom$.next(0.9);
    }

    zoomIn() {
        this.zoom$.next(1.1);
    }

    // resetZoom() {

    //     switch (this.layout) {
    //         case "initiatives":
    //             this.show(this.data, this.VIEWPORT_WIDTH / 2, this.VIEWPORT_HEIGHT / 2, 1);
    //             break;
    //         case "people":
    //             this.show(this.data, 100, 0, 1);
    //             break;
    //         default:
    //             this.show(this.data, this.VIEWPORT_WIDTH / 2, this.VIEWPORT_HEIGHT / 2, 1);
    //             break;
    //     }
    // }

    changeFontSize(size: number) {
        this.fontSize$.next(size);
        this.analytics.eventTrack("Change font size", { size: size, map: this.data.initiative.name })
    }
}