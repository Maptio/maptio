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
    public datasetId: string;
    public slug: string;

    public fontSize$: BehaviorSubject<number>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;

    @Output("showDetails") showDetails = new EventEmitter<Initiative>();
    @Output("addInitiative") addInitiative = new EventEmitter<Initiative>();
    @Output("removeInitiative") removeInitiative = new EventEmitter<Initiative>();
    @Output("moveInitiative") moveInitiative = new EventEmitter<{ node: Initiative, from: Initiative, to: Initiative }>();

    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild("drawing")
    public element: ElementRef;

    public componentFactory: ComponentFactory<IDataVisualizer>;
    public layout: string;
    public subscription: Subscription;
    public instance: IDataVisualizer;

    constructor(
        private dataService: DataService,
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private analytics: Angulartics2Mixpanel
    ) {
        this.zoom$ = new Subject<number>();
        this.fontSize$ = new BehaviorSubject<number>(16);
        this.isLoading = new BehaviorSubject<boolean>(true);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
        this.isLoading.next(true);

        this.subscription = this.route.params
            .map(params => { this.layout = params["layout"]; return this.layout })
            .do(layout => {
                this.isLoading.next(true);

                this.componentFactory = this.getComponentFactory(layout);
                let component = this.anchorComponent.createComponent<IDataVisualizer>(this.componentFactory);
                this.instance = this.getInstance(component);
            })
            .withLatestFrom(this.route.fragment)
            .do(([layout, fragment]: [string, string]) => {
                this.isLoading.next(true);
                let f = fragment || this.getFragment(this.layout);
                this.x = Number.parseFloat(f.split("&")[0].replace("x=", ""))
                this.y = Number.parseFloat(f.split("&")[1].replace("y=", ""))
                this.scale = Number.parseFloat(f.split("&")[2].replace("scale=", ""));

                this.setup();
                // this.instance.init(undefined, undefined);

            })
            .combineLatest(this.dataService.get())
            .map(data => data[1])
            .do((data) => {
                // console.log(data.datasetId, data.initiative.getSlug());
                this.datasetId = data.datasetId;
                this.slug = data.initiative.getSlug();
                this.isLoading.next(false);
            })
            .subscribe((data) => {
                this.instance.data$.next(data);
            })

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
            default:
                return this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent);
        }
    }

    getInstance(component: ComponentRef<IDataVisualizer>): IDataVisualizer {
        return component.instance;
    }

    setup() {
        this.instance.showDetailsOf$.asObservable().subscribe(node => {
            this.showDetails.emit(node)
        })
        this.instance.addInitiative$.asObservable().subscribe(node => {
            // console.log("mapping.component.ts", "adding initiative under", node.name)
            this.addInitiative.emit(node)
        })
        this.instance.removeInitiative$.asObservable().subscribe(node => {
            // console.log("mapping.component.ts", "remove initiative", node.name)
            this.removeInitiative.emit(node)
        })
        this.instance.moveInitiative$.asObservable().subscribe(({ node: node, from: from, to: to }) => {
            // console.log("mapping.component.ts", "move initiative", node.name, to.name)
            this.moveInitiative.emit({ node: node, from: from, to: to })
        })
        this.instance.width = this.VIEWPORT_WIDTH;
        this.instance.height = this.VIEWPORT_HEIGHT;

        this.instance.margin = 50;
        this.instance.zoom$ = this.zoom$.asObservable();
        this.instance.fontSize$ = this.fontSize$.asObservable();
        this.instance.translateX = this.x;
        this.instance.translateY = this.y;
        this.instance.scale = this.scale;
        this.instance.isReset$ = new Subject<boolean>();
    }


    zoomOut() {
        this.zoom$.next(0.9);
    }

    zoomIn() {
        this.zoom$.next(1.1);
    }

    resetZoom() {
        this.instance.isReset$.next(true);
    }

    changeFontSize(size: number) {
        this.fontSize$.next(size);
        // this.analytics.eventTrack("Change font size", { size: size, map: this.data.initiative.name })
    }
}