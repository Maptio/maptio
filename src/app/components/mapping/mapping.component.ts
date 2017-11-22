import { Initiative } from "./../../shared/model/initiative.data";
// import { MappingNetworkComponent } from "./network/mapping.network.component";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";

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
import { MappingNetworkComponent } from "./network/mapping.network.component";

@Component({
    selector: "mapping",
    templateUrl: "./mapping.component.html",
    styleUrls: ["./mapping.component.css"],
    entryComponents: [MappingCirclesComponent, MappingTreeComponent, MappingNetworkComponent],
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
    public isLocked: boolean = true;

    public isCollapsed: boolean = true;

    public zoom$: Subject<number>;
    private VIEWPORT_WIDTH: number = 1522;
    private VIEWPORT_HEIGHT: number = 1522;

    public isLoading: Subject<boolean>;
    public datasetId: string;
    public teamName: string;
    public teamId: string;
    public slug: string;

    public fontSize$: BehaviorSubject<number>;
    public isLocked$: BehaviorSubject<boolean>;
    public closeEditingPanel$: BehaviorSubject<boolean>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;


    @Output("showDetails") showDetails = new EventEmitter<Initiative>();
    @Output("addInitiative") addInitiative = new EventEmitter<Initiative>();
    @Output("removeInitiative") removeInitiative = new EventEmitter<Initiative>();
    @Output("moveInitiative") moveInitiative = new EventEmitter<{ node: Initiative, from: Initiative, to: Initiative }>();
    @Output("closeEditingPanel") closeEditingPanel = new EventEmitter<boolean>();

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
        this.isLocked$ = new BehaviorSubject<boolean>(this.isLocked);
        this.closeEditingPanel$ = new BehaviorSubject<boolean>(false);
        this.isLoading = new BehaviorSubject<boolean>(true);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
        this.isLoading.next(true);

        this.subscription = this.route.params
            .map(params => {
                this.layout = params["layout"];
                this.cd.markForCheck();
                this.analytics.eventTrack("Map", { view: this.layout, team: this.teamName, teamId: this.teamId });

                return this.layout
            })
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
            })
            .combineLatest(this.dataService.get())
            .map(data => data[1])
            .do((data) => {
                this.datasetId = data.datasetId;
                this.teamId = data.teamId;
                this.teamName = data.teamName;
                this.slug = data.initiative.getSlug();
                this.isLoading.next(false);
            })
            .subscribe((data) => {
                // until the initiave has some children, we leve it in lock mode
                if (!data.initiative.children || !data.initiative.children[0] || !data.initiative.children[0].children) {
                    this.lock(false);
                    this.cd.markForCheck();
                }
                this.instance.teamId = data.teamId;
                this.instance.teamName = data.teamName;
                this.instance.data$.next(data);
            })

    }

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }

    getFragment(layout: string) {
        switch (layout) {
            case "initiatives":
                return `x=${this.VIEWPORT_WIDTH / 2}&y=${this.VIEWPORT_HEIGHT / 2}&scale=1`
            case "people":
                return `x=100&y=${this.VIEWPORT_HEIGHT / 4}&scale=1`
            case "connections":
                return `x=0&y=${-this.VIEWPORT_HEIGHT / 4}&scale=1`
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
            case "connections":
                return this.componentFactoryResolver.resolveComponentFactory(MappingNetworkComponent);
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
        this.instance.closeEditingPanel$.asObservable().subscribe((close: boolean) => {
            this.closeEditingPanel.emit(true);
        })

        this.instance.width = this.VIEWPORT_WIDTH;
        this.instance.height = this.VIEWPORT_HEIGHT;

        this.instance.margin = 50;
        this.instance.zoom$ = this.zoom$.asObservable();
        this.instance.fontSize$ = this.fontSize$.asObservable();
        this.instance.isLocked$ = this.isLocked$.asObservable();
        this.instance.translateX = this.x;
        this.instance.translateY = this.y;
        this.instance.scale = this.scale;
        this.instance.analytics = this.analytics;
        this.instance.isReset$ = new Subject<boolean>();
    }


    zoomOut() {
        this.zoom$.next(0.9);
        this.analytics.eventTrack("Map", { action: "zoom out", mode: "button", team: this.teamName, teamId: this.teamId });
    }

    zoomIn() {
        this.zoom$.next(1.1);
        this.analytics.eventTrack("Map", { action: "zoom in", mode: "button", team: this.teamName, teamId: this.teamId });
    }

    resetZoom() {
        this.instance.isReset$.next(true);
        this.analytics.eventTrack("Map", { action: "reset zoom", mode: "button", team: this.teamName, teamId: this.teamId });
    }


    lock(locking: boolean) {
        this.isLocked = locking;
        this.isLocked$.next(this.isLocked);
        this.analytics.eventTrack("Map", { action: (locking ? "lock" : "unlock"), team: this.teamName, teamId: this.teamId });
    }

    isDisplayLockingToggle() {
        return this.layout !== "people" && this.layout !== "connections";

    }

    changeFontSize(size: number) {
        this.fontSize$.next(size);
        this.analytics.eventTrack("Map", { action: "change font size", size: size, team: this.teamName, teamId: this.teamId })
    }
}