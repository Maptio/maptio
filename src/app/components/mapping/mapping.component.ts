import { Initiative } from "./../../shared/model/initiative.data";
// import { MappingNetworkComponent } from "./network/mapping.network.component";
import { Angulartics2Mixpanel } from "angulartics2";

import { ActivatedRoute } from "@angular/router";
import {
    Component, EventEmitter,
    ViewChild, ElementRef,
    ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, Output, Input, SimpleChanges
} from "@angular/core";

import { DataService } from "../../shared/services/data.service"
import { IDataVisualizer } from "./mapping.interface"
import { MappingCirclesComponent } from "./circles/mapping.circles.component"
import { MappingTreeComponent } from "./tree/mapping.tree.component"

import "rxjs/add/operator/map"
import { Subject, BehaviorSubject, Subscription, } from "rxjs/Rx";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { MemberSummaryComponent } from "./member-summary/member-summary.component";
import { Tag, SelectableTag } from "../../shared/model/tag.data";

@Component({
    selector: "mapping",
    templateUrl: "./mapping.component.html",
    styleUrls: ["./mapping.component.css"],
    entryComponents: [MappingCirclesComponent, MappingTreeComponent, MappingNetworkComponent, MemberSummaryComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class MappingComponent {

    PLACEMENT: string = "left"
    TOGGLE: string = "tooltip"
    TOOLTIP_PEOPLE_VIEW: string = "People view";
    TOOLTIP_INITIATIVES_VIEW: string = "Initiatives view";
    TOOLTIP_ZOOM_IN: string = "Zoom in";
    TOOLTIP_ZOOM_OUT: string = "Zoom out";
    TOOLTIP_ZOOM_FIT: string = "Zoom fit";

    public data: { initiative: Initiative, datasetId: string, teamName: string, teamId: string };
    public x: number;
    public y: number;
    public scale: number;
    public isLocked: boolean = true;

    public isCollapsed: boolean = true;
    public isSettingsPanelCollapsed: boolean = true;

    public zoom$: Subject<number>;
    public isReset$: Subject<boolean>;
    public selectableTags$: Subject<Array<SelectableTag>>;
    private VIEWPORT_WIDTH: number = 1522;
    private VIEWPORT_HEIGHT: number = 1522;

    public isLoading: boolean;
    public datasetId: string;
    public teamName: string;
    public teamId: string;
    public slug: string;
    public tags: Array<SelectableTag>;

    public fontSize$: BehaviorSubject<number>;
    public isLocked$: BehaviorSubject<boolean>;
    public closeEditingPanel$: BehaviorSubject<boolean>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;

    @Input("tags") selectableTags: Array<SelectableTag>;
    @Output("showDetails") showDetails = new EventEmitter<Initiative>();
    @Output("addInitiative") addInitiative = new EventEmitter<Initiative>();
    @Output("removeInitiative") removeInitiative = new EventEmitter<Initiative>();
    @Output("moveInitiative") moveInitiative = new EventEmitter<{ node: Initiative, from: Initiative, to: Initiative }>();
    @Output("closeEditingPanel") closeEditingPanel = new EventEmitter<boolean>();

    // @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild("drawing")
    public element: ElementRef;

    public componentFactory: ComponentFactory<IDataVisualizer>;
    public layout: string;
    public subscription: Subscription;
    public instance: IDataVisualizer;

    constructor(
        private dataService: DataService,
        // private viewContainer: ViewContainerRef,
        // private componentFactoryResolver: ComponentFactoryResolver,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private analytics: Angulartics2Mixpanel
    ) {
        this.zoom$ = new Subject<number>();
        this.isReset$ = new Subject<boolean>();
        this.selectableTags$ = new Subject<Array<Tag>>();
        this.fontSize$ = new BehaviorSubject<number>(16);
        this.isLocked$ = new BehaviorSubject<boolean>(this.isLocked);
        this.closeEditingPanel$ = new BehaviorSubject<boolean>(false);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
    }

    ngAfterViewInit() {
    }

    onActivate(component: IDataVisualizer) {
        component.showDetailsOf$.asObservable().subscribe(node => {
            this.showDetails.emit(node)
        })
        component.addInitiative$.asObservable().subscribe(node => {
            this.addInitiative.emit(node)
        })
        component.removeInitiative$.asObservable().subscribe(node => {
            this.removeInitiative.emit(node)
        })
        component.moveInitiative$.asObservable().subscribe(({ node: node, from: from, to: to }) => {
            this.moveInitiative.emit({ node: node, from: from, to: to })
        })
        component.closeEditingPanel$.asObservable().subscribe((close: boolean) => {
            this.closeEditingPanel.emit(true);
        })

        let f = this.route.snapshot.fragment || this.getFragment(component);
        this.x = Number.parseFloat(f.split("&")[0].replace("x=", ""))
        this.y = Number.parseFloat(f.split("&")[1].replace("y=", ""))
        this.scale = Number.parseFloat(f.split("&")[2].replace("scale=", ""));

        this.layout = this.getLayout(component);

        component.width = this.VIEWPORT_WIDTH;
        component.height = this.VIEWPORT_HEIGHT;

        component.margin = 50;
        component.zoom$ = this.zoom$.asObservable();
        component.selectableTags$ = this.selectableTags$.asObservable();
        component.fontSize$ = this.fontSize$.asObservable();
        component.isLocked$ = this.isLocked$.asObservable();
        component.translateX = this.x;
        component.translateY = this.y;
        component.scale = this.scale;
        component.analytics = this.analytics;
        component.isReset$ = this.isReset$.asObservable();
        if (component.constructor === MemberSummaryComponent) {
            component.closeEditingPanel$.next(true)
        }
    }

    onDeactivate(component: any) {

    }

    ngOnInit() {

        this.subscription = this.route.params
            .do(params => {
                this.datasetId = params["mapid"];
                this.slug = params["mapslug"];
                this.cd.markForCheck();
            })
            .combineLatest(this.dataService.get())
            .map(data => data[1])
            .subscribe((data) => {
                if (!data.initiative.children || !data.initiative.children[0] || !data.initiative.children[0].children) {
                    this.lock(false);
                    this.cd.markForCheck();
                }
                this.tags = data.tags;
                this.cd.markForCheck();
            })
    }

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }

    toggleSettingsPanel() {
        this.isSettingsPanelCollapsed = !this.isSettingsPanelCollapsed;
    }

    getFragment(component: IDataVisualizer) {
        switch (component.constructor) {
            case MappingCirclesComponent:
                return `x=${this.VIEWPORT_WIDTH / 2}&y=${this.VIEWPORT_HEIGHT / 2}&scale=1`
            case MappingTreeComponent:
                return `x=100&y=${this.VIEWPORT_HEIGHT / 4}&scale=1`
            case MappingNetworkComponent:
                return `x=0&y=${-this.VIEWPORT_HEIGHT / 4}&scale=1`
            case MemberSummaryComponent:
                return `x=0&y=0&scale=1`;
            default:
                return `x=${this.VIEWPORT_WIDTH / 2}&y=${this.VIEWPORT_HEIGHT / 2}&scale=1`
        }
    }

    getLayout(component: IDataVisualizer) {
        switch (component.constructor) {
            case MappingCirclesComponent:
                return `initiatives`
            case MappingTreeComponent:
                return `people`
            case MappingNetworkComponent:
                return `connections`
            case MemberSummaryComponent:
                return `list`
            default:
                return `initiatives`
        }
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
        this.isReset$.next(true);
        this.analytics.eventTrack("Map", { action: "reset zoom", mode: "button", team: this.teamName, teamId: this.teamId });
    }


    lock(locking: boolean) {
        this.isLocked = locking;
        this.isLocked$.next(this.isLocked);
        this.analytics.eventTrack("Map", { action: (locking ? "lock" : "unlock"), team: this.teamName, teamId: this.teamId });
    }

    isDisplayLockingToggle() {
        return this.layout !== "people" && this.layout !== "connections" && this.layout !== "list";

    }

    changeFontSize(size: number) {
        this.fontSize$.next(size);
        this.analytics.eventTrack("Map", { action: "change font size", size: size, team: this.teamName, teamId: this.teamId })
    }

    toggleTag(tag: SelectableTag) {
        tag.isSelected = !tag.isSelected;
        this.selectableTags$.next(this.tags);

        // this.selectableTags = this.dataset.tags.map(t => <SelectableTag>t) // .filter(t => t.isSelected);
    }
}