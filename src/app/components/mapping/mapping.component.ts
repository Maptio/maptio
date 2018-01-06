import { Initiative } from "./../../shared/model/initiative.data";
// import { MappingNetworkComponent } from "./network/mapping.network.component";
import { Angulartics2Mixpanel } from "angulartics2";

import { ActivatedRoute } from "@angular/router";
import {
    Component, EventEmitter,
    ViewChild, ElementRef,
    ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, Output, Input, SimpleChanges
} from "@angular/core";

import { DataService, URIService } from "../../shared/services/data.service"
import { IDataVisualizer } from "./mapping.interface"
import { MappingCirclesComponent } from "./circles/mapping.circles.component"
import { MappingTreeComponent } from "./tree/mapping.tree.component"

import "rxjs/add/operator/map"
import { Subject, BehaviorSubject, Subscription, ReplaySubject, } from "rxjs/Rx";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { MemberSummaryComponent } from "./member-summary/member-summary.component";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import * as _ from "lodash";

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
    public isTagSettingActive: boolean;
    public isMapSettingActive: boolean;

    public zoom$: Subject<number>;
    public isReset$: Subject<boolean>;
    public selectableTags$: Subject<Array<SelectableTag>>;
    private VIEWPORT_WIDTH: number = 1522;
    private VIEWPORT_HEIGHT: number = 1522;

    public isLoading: boolean;
    public datasetId: string;
    public datasetName: string;
    public initiative: Initiative;
    public teamName: string;
    public teamId: string;
    public slug: string;
    public tags: Array<SelectableTag>;
    public tagsFragment: string;

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
    @Output("toggleSettingsPanel") toggleSettingsPanel = new EventEmitter<boolean>();
    @Output("applySettings") applySettings = new EventEmitter<{ initiative: Initiative, tags: Tag[] }>();
    // @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

    @ViewChild("drawing")
    public element: ElementRef;

    public componentFactory: ComponentFactory<IDataVisualizer>;
    public layout: string;
    public subscription: Subscription;
    public instance: IDataVisualizer;
    public newTagForm: FormGroup;
    newTagColor = "#fff";

    constructor(
        private dataService: DataService,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        private analytics: Angulartics2Mixpanel,
        private uriService: URIService
    ) {
        this.zoom$ = new Subject<number>();
        this.isReset$ = new Subject<boolean>();
        this.selectableTags$ = new ReplaySubject<Array<SelectableTag>>();
        this.fontSize$ = new BehaviorSubject<number>(16);
        this.isLocked$ = new BehaviorSubject<boolean>(this.isLocked);
        this.closeEditingPanel$ = new BehaviorSubject<boolean>(false);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();

        this.newTagForm = new FormGroup({
            "name": new FormControl("", [
                Validators.required
            ]),
            "color": new FormControl(this.newTagColor, [
                Validators.required
            ])
        });
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
        this.x = Number.parseFloat(this.uriService.parseFragment(f).get("x"));
        this.y = Number.parseFloat(this.uriService.parseFragment(f).get("y"))
        this.scale = Number.parseFloat(this.uriService.parseFragment(f).get("scale"))

        let tagsState = this.uriService.parseFragment(f).has("tags") && this.uriService.parseFragment(f).get("tags")
            ? this.uriService.parseFragment(f).get("tags")
                .split(",")
                .map((s: string) => new SelectableTag({ shortid: s.split(':')[0], isSelected: s.split(':')[1] === "1" ? true : false }))
            : [];

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
        component.tagsState = tagsState;
        this.selectableTags$.next(tagsState)

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
            .combineLatest(this.route.fragment)
            .subscribe(([data, fragment]) => {
                if (!data.initiative.children || !data.initiative.children[0] || !data.initiative.children[0].children) {
                    this.lock(false);
                    this.cd.markForCheck();
                }
                // this.tags = data.tags;
                let fragmentTags = this.uriService.parseFragment(fragment).has("tags") && this.uriService.parseFragment(fragment).get("tags")
                    ? this.uriService.parseFragment(fragment).get("tags")
                        .split(",")
                        .map((s: string) => new SelectableTag({ shortid: s.split(':')[0], isSelected: s.split(':')[1] === "1" ? true : false }))
                    : <SelectableTag[]>data.tags;

                this.tags = _.zip(fragmentTags, data.tags).map(([fragmentT, dataT]) => {
                    return new SelectableTag({ shortid: dataT.shortid, name: dataT.name, color: dataT.color, isSelected: fragmentT.isSelected })
                })
                // console.log(this.uriService.parseFragment(fragment), tags)


                this.datasetName = data.initiative.name;
                this.initiative = data.initiative;
                this.cd.markForCheck();
            });

        this.route.fragment.subscribe(f => {


        })
    }

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
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
        let tagsHash = this.tags.map(t => `${t.shortid}:${t.isSelected ? 1 : 0}`).join(',');
        this.tagsFragment = `tags=${tagsHash}`;

        let ancient = this.uriService.parseFragment(this.route.snapshot.fragment);
        ancient.set("tags", tagsHash);
        location.hash = this.uriService.buildFragment(ancient);

        this.selectableTags$.next(this.tags);
    }

    getTagsFragment(layout: string) {
        console.log(layout, this.tagsFragment)
        return this.tagsFragment;
    }

    saveColor(tag: Tag, color: string) {
        console.log("changing color", tag, color)
        tag.color = color;
        this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
    }

    saveTagName(tag: Tag, name: string) {
        console.log("changing name", tag, name)
        tag.name = name;
        this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
    }

    addTag() {
        console.log(this.newTagForm.controls);

        if (this.newTagForm.dirty && this.newTagForm.valid) {
            let name = this.newTagForm.controls["name"].value;
            let tag = new Tag().create(name, this.newTagColor);

            this.tags.unshift(<SelectableTag>tag)
            this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
            this.newTagForm.reset();
        }
    }

    removeTag(tag: Tag) {
        let index = this.tags.findIndex(t => t.shortid === tag.shortid);
        this.tags.splice(index, 1);
        this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
    }

    toggleTagSettingsTab() {
        this.isSettingsPanelCollapsed = !this.isSettingsPanelCollapsed;

        this.isTagSettingActive = true;
        if (this.isSettingsPanelCollapsed) {
            this.isMapSettingActive = false;
            this.isTagSettingActive = false;
        }
    }

    togglePanel() {
        this.isSettingsPanelCollapsed = !this.isSettingsPanelCollapsed;

        this.isMapSettingActive = true;
        if (this.isSettingsPanelCollapsed) {
            this.isMapSettingActive = false;
            this.isTagSettingActive = false;
        }
        this.toggleSettingsPanel.emit(this.isSettingsPanelCollapsed)
    }



}