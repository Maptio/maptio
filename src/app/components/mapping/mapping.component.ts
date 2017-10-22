import { Initiative } from "./../../shared/model/initiative.data";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { Angulartics2Mixpanel } from "angulartics2";

import { ActivatedRoute, Params } from "@angular/router";
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
    public isCollapsed: boolean = true;

    public zoom$: Subject<number>

    public fontSize$: BehaviorSubject<number>;

    @Output("showDetails") showDetails = new EventEmitter<Initiative>();

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

        this.subscription =
            Observable
                .combineLatest(this.route.params.distinct(), this.dataService.get())
                .subscribe((value) => {
                    let layout = value[0]["layout"];
                    this.data = value[1];

                    this.componentFactory = this.getComponentFactory(layout)

                    this.show(value[1]);

                })
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getComponentFactory(layout: string) {
        switch (layout) {
            case "initiatives":
                return this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent);
            case "people":
                return this.componentFactoryResolver.resolveComponentFactory(MappingTreeComponent);
            case "network":
                return this.componentFactoryResolver.resolveComponentFactory(MappingNetworkComponent);
            default:
                return this.componentFactoryResolver.resolveComponentFactory(MappingCirclesComponent);
        }
    }

    getInstance(component: ComponentRef<IDataVisualizer>): IDataVisualizer {
        return component.instance;
    }

    show(data: any) {
        let component = this.anchorComponent.createComponent<IDataVisualizer>(this.componentFactory);

        let instance = this.getInstance(component);
        instance.showDetailsOf$.asObservable().subscribe(node => {
            this.showDetails.emit(node)
        })
        instance.width = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.height = 1522; // this.element.nativeElement.parentNode.parentNode.parentNode.offsetHeight;
        instance.margin = 50;
        instance.datasetId = data.datasetId;
        instance.zoom$ = this.zoom$.asObservable();
        instance.fontSize$ = this.fontSize$.asObservable();
        instance.draw(data.initiative);
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
        this.analytics.eventTrack("Change font size", { size: size, map: this.data.initiative.name })
    }
}