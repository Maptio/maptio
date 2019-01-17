import "rxjs/add/operator/map";

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Angulartics2Mixpanel } from "angulartics2";
import { compact } from "lodash";
import { BehaviorSubject, ReplaySubject, Subject, Subscription } from "rxjs";

import { saveAs } from "file-saver"
import { Initiative } from "../../../shared/model/initiative.data";
import { SelectableTag, Tag } from "../../../shared/model/tag.data";
import { Team } from "../../../shared/model/team.data";
import { DataService } from "../../../shared/services/data.service";
import { UIService } from "../../../shared/services/ui/ui.service";
import { URIService } from "../../../shared/services/uri.service";
import { IDataVisualizer } from "./mapping.interface";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { MappingTreeComponent } from "./tree/mapping.tree.component";
import { MappingZoomableComponent } from "./zoomable/mapping.zoomable.component";
import { ExportService } from "../../../shared/services/export/export.service";
import { Intercom } from "ng-intercom";
import { User } from "../../../shared/model/user.data";
import { MappingSummaryComponent } from "./summary/summary.component";
import { SearchComponent } from "../search/search.component";
import { environment } from "../../../../environment/environment";
import * as screenfull from 'screenfull';

// import { MappingNetworkComponent } from "./network/mapping.network.component";
// import { MappingCirclesComponent } from "./circles/mapping.circles.component";


declare var canvg: any;

@Component({
  selector: "mapping",
  templateUrl: "./mapping.component.html",
  styleUrls: ["./mapping.component.css"],
  entryComponents: [
    MappingTreeComponent,
    MappingNetworkComponent,
    MappingSummaryComponent,
    MappingZoomableComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingComponent {
  isFirstEdit: boolean;
  PLACEMENT: string = "left";
  TOGGLE: string = "tooltip";
  TOOLTIP_PEOPLE_VIEW: string = "People view";
  TOOLTIP_INITIATIVES_VIEW: string = "Circles view";
  TOOLTIP_ZOOM_IN: string = "Zoom in";
  TOOLTIP_ZOOM_OUT: string = "Zoom out";
  TOOLTIP_ZOOM_FIT: string = "Zoom fit";
  DEFAULT_TEXT_COLOR: string = environment.DEFAULT_MAP_TEXT_COLOR;
  DEFAULT_MAP_COLOR: string = environment.DEFAULT_MAP_BACKGOUND_COLOR;
  fullScreenLib: any = screenfull;

  isFullScreen: boolean;

  public data: {
    initiative: Initiative;
    datasetId: string;
    teamName: string;
    teamId: string;
  };
  public x: number;
  public y: number;
  public scale: number;
  // public isLocked: boolean = true;

  //   public isCollapsed: boolean = true;
  //   public isSettingsPanelCollapsed: boolean = true;
  //   public isTagSettingActive: boolean;
  public isSettingToggled: boolean;
  public isSearchToggled: boolean;
  public isMapSettingsDisabled: boolean;

  public zoom$: Subject<number>;
  public isReset$: Subject<boolean>;
  public selectableTags$: Subject<Array<SelectableTag>>;
  // public selectableUsers$: Subject<Array<SelectableUser>>;

  public VIEWPORT_WIDTH: number; // = document.body.clientWidth -120;
  public VIEWPORT_HEIGHT: number; // = document.body.clientHeight-125;

  public isLoading: boolean;
  public datasetId: string;
  public datasetName: string;
  public initiative: Initiative;
  public flattenInitiative: Initiative[] = [];
  public team: Team;
  public slug: string;
  public tags: Array<SelectableTag>;
  public tagsFragment: string;
  public fontSize$: BehaviorSubject<number>;
  // public fontColor$: BehaviorSubject<string>;
  public mapColor$: BehaviorSubject<string>;

  public zoomToInitiative$: Subject<Initiative>;
  public closeEditingPanel$: BehaviorSubject<boolean>;
  public data$: Subject<{ initiative: Initiative; datasetId: string }>;

  @Input("tags") selectableTags: Array<SelectableTag>;
  @Input("isEmptyMap") isEmptyMap: Boolean;
  @Output("showDetails") showDetails = new EventEmitter<Initiative>();
  @Output("addInitiative") addInitiative = new EventEmitter<{ node: Initiative, subNode: Initiative }>();
  @Output("removeInitiative") removeInitiative = new EventEmitter<Initiative>();
  @Output("moveInitiative")
  moveInitiative = new EventEmitter<{
    node: Initiative;
    from: Initiative;
    to: Initiative;
  }>();
  @Output("closeEditingPanel") closeEditingPanel = new EventEmitter<boolean>();
  @Output("openTreePanel") openTreePanel = new EventEmitter<boolean>();
  @Output("expandTree") expandTree = new EventEmitter<boolean>();
  @Output("toggleSettingsPanel")
  toggleSettingsPanel = new EventEmitter<boolean>();
  @Output("applySettings") applySettings = new EventEmitter<{ initiative: Initiative; tags: Tag[] }>();
  @Output("toggleEditingPanelsVisibility") toggleEditingPanelsVisibility = new EventEmitter<Boolean>();

  public componentFactory: ComponentFactory<IDataVisualizer>;
  // public layout: string;
  public subscription: Subscription;
  public instance: IDataVisualizer;

  public settings: {
    fontColor: string,
    mapColor: string,
    fontSize: number,
    explorationMode: boolean
  } = {
      fontColor: localStorage.getItem("FONT_COLOR") || this.DEFAULT_TEXT_COLOR,
      mapColor: localStorage.getItem("MAP_COLOR") || this.DEFAULT_MAP_COLOR,
      fontSize: Number.parseFloat(localStorage.getItem("FONT_SIZE")) || 1,
      explorationMode: localStorage.getItem("CIRCLE_VIEW_MODE") === "flat" || false
    }

  isFiltersToggled: boolean = false;
  isSearchDisabled: boolean = false;
  public _toggleOptions: Boolean = false;
  public toggleOptions$: BehaviorSubject<Boolean> = new BehaviorSubject(this._toggleOptions)

  constructor(
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private analytics: Angulartics2Mixpanel,
    private uriService: URIService,
    public uiService: UIService,
    private exportService: ExportService,
    private intercom: Intercom,
    private router: Router
  ) {
    this.zoom$ = new Subject<number>();
    this.isReset$ = new Subject<boolean>();
    this.selectableTags$ = new ReplaySubject<Array<SelectableTag>>();
    // this.selectableUsers$ = new ReplaySubject<Array<SelectableUser>>();
    this.fontSize$ = new BehaviorSubject<number>(this.settings.fontSize);
    // this.fontColor$ = new BehaviorSubject<string>(this.settings.fontColor);
    this.mapColor$ = new BehaviorSubject<string>(this.settings.mapColor);
    this.zoomToInitiative$ = new Subject();
    // this.isLocked$ = new BehaviorSubject<boolean>(this.isLocked);
    this.closeEditingPanel$ = new BehaviorSubject<boolean>(false);
    this.data$ = new Subject<{
      initiative: Initiative;
      datasetId: string;
    }>();

  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      if (params.id) {
        this.emitOpenInitiative(new Initiative({ id: <number>params.id }));
      }
      if (params.reload) {
        this.changeMapColor(params.color);
      }
    });

    this.fullScreenLib.on("change", () => {
      if (document.querySelector("svg#map")) {
        document.querySelector("svg#map").setAttribute("width", `${this.uiService.getCanvasWidth()}`)
        document.querySelector("svg#map").setAttribute("height", `${this.uiService.getCanvasHeight()}`);

      }
      this.isFullScreen = this.fullScreenLib.isFullscreen;
      console.log(this.isFullScreen)
      this.cd.markForCheck();
    })
  }

  onActivate(component: IDataVisualizer) {
    this.VIEWPORT_HEIGHT = this.uiService.getCanvasHeight();
    this.VIEWPORT_WIDTH = this.uiService.getCanvasWidth();





    component.showToolipOf$.asObservable().subscribe((tooltip: { initiatives: Initiative[], isNameOnly: boolean }) => {
      this.showTooltip(tooltip.initiatives, tooltip.isNameOnly);
    })

    component.showDetailsOf$.asObservable().subscribe(node => {
      this.emitOpenInitiative(node)
    })

    component.showContextMenuOf$.asObservable().subscribe(node => {
      this.showContextMenu(node);
    })

    component.moveInitiative$
      .asObservable()
      .subscribe(({ node: node, from: from, to: to }) => {
        this.moveInitiative.emit({ node: node, from: from, to: to });
      });
    component.closeEditingPanel$.asObservable().subscribe((close: boolean) => {
      this.closeEditingPanel.emit(true);
    });

    let f = this.route.snapshot.fragment || this.getFragment(component);
    this.x = Number.parseFloat(this.uriService.parseFragment(f).get("x"));
    this.y = Number.parseFloat(this.uriService.parseFragment(f).get("y"));
    this.scale = Number.parseFloat(
      this.uriService.parseFragment(f).get("scale")
    );

    let tagsState =
      this.uriService.parseFragment(f).has("tags") &&
        this.uriService.parseFragment(f).get("tags")
        ? this.uriService
          .parseFragment(f)
          .get("tags")
          .split(",")
          .map(
            (s: string) => new SelectableTag({ shortid: s, isSelected: true })
          )
        : [];

    component.width = this.VIEWPORT_WIDTH;
    component.height = this.VIEWPORT_HEIGHT;

    component.margin = 50;
    component.zoom$ = this.zoom$.asObservable();
    component.selectableTags$ = this.selectableTags$.asObservable();
    // component.fontColor$ = this.fontColor$.asObservable();
    component.mapColor$ = this.mapColor$.asObservable();
    component.zoomInitiative$ = this.zoomToInitiative$.asObservable();
    component.toggleOptions$ = this.toggleOptions$.asObservable();
    component.translateX = this.x;
    component.translateY = this.y;
    component.scale = this.scale;
    component.tagsState = tagsState;
    this.selectableTags$.next(tagsState);

    component.analytics = this.analytics;
    component.isReset$ = this.isReset$.asObservable();

    if (component.constructor === MappingSummaryComponent) {
      this.isMapSettingsDisabled = true;
      this.toggleEditingPanelsVisibility.emit(false)
    }
    else {
      this.isSearchDisabled = false;
      this.isMapSettingsDisabled = false;
      this.toggleEditingPanelsVisibility.emit(true)
    }
    // this.toggleOptions(false);
  }

  onDeactivate(component: any) { }

  ngOnInit() {
    this.subscription = this.route.params
      .do(params => {
        if (this.datasetId !== params["mapid"]) {
          this.showTooltip(null, null);
          this.showContextMenu({ initiatives: null, x: 0, y: 0, isReadOnlyContextMenu: null })

        }
        this.datasetId = params["mapid"];
        this.slug = params["mapslug"];

        if (!localStorage.getItem(`map_settings_${this.datasetId}`)) {
          localStorage.setItem(`map_settings_${this.datasetId}`, JSON.stringify(
            {
              fontColor: localStorage.getItem("FONT_COLOR") || this.DEFAULT_TEXT_COLOR,
              mapColor: localStorage.getItem("MAP_COLOR") || this.DEFAULT_MAP_COLOR,
              fontSize: Number.parseFloat(localStorage.getItem("FONT_SIZE")) || 1,
              explorationMode: localStorage.getItem("CIRCLE_VIEW_MODE") === "flat" || false

            }
          ))
        }
        this.settings = JSON.parse(localStorage.getItem(`map_settings_${this.datasetId}`));
        // this.fontColor$.next(this.settings.fontColor);
        this.mapColor$.next(this.settings.mapColor)
        this.fontSize$.next(this.settings.fontSize);

        this.cd.markForCheck();
      })
      .combineLatest(this.dataService.get())
      .map(data => data[1])
      .combineLatest(this.route.fragment) // PEFORMACE : with latest changes
      .subscribe(([data, fragment]) => {
        if (!data.initiative.children || !data.initiative.children[0] || !data.initiative.children[0].children) {
          this.isFirstEdit = true;
          this.cd.markForCheck();
        }
        else {
          this.isFirstEdit = false;
          this.cd.markForCheck();
        }

        let fragmentTags =
          this.uriService.parseFragment(fragment).has("tags") &&
            this.uriService.parseFragment(fragment).get("tags")
            ? this.uriService
              .parseFragment(fragment)
              .get("tags")
              .split(",")
              .map(
                (s: string) =>
                  new SelectableTag({ shortid: s, isSelected: true })
              )
            : <SelectableTag[]>[];

        this.tags = compact<SelectableTag>(
          data.dataset.tags.map((dataTag: SelectableTag) => {
            let searchTag = fragmentTags.find(
              t => t.shortid === dataTag.shortid
            );
            return new SelectableTag({
              shortid: dataTag.shortid,
              name: dataTag.name,
              color: dataTag.color,
              isSelected: searchTag !== undefined
            });
          })
        );

        this.datasetName = data.initiative.name;
        this.initiative = data.initiative;
        this.team = data.team;
        this.flattenInitiative = data.initiative.flatten();
        this.cd.markForCheck();
      });

    this.route.fragment.subscribe(f => { });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  getFragment(component: IDataVisualizer) {
    switch (component.constructor) {
      case MappingZoomableComponent:
        return `x=${(this.VIEWPORT_WIDTH - 20) / 2}&y=${(this.VIEWPORT_WIDTH - 20) / 2}&scale=1`;
      case MappingTreeComponent:
        return `x=${this.VIEWPORT_WIDTH / 10}&y=${this.VIEWPORT_HEIGHT / 2}&scale=1`;
      case MappingNetworkComponent:
        return `x=0&y=${-this.VIEWPORT_HEIGHT / 4}&scale=1`;
      case MappingSummaryComponent:
        return `x=0&y=0&scale=1`;
      default:
        return `x=${(this.VIEWPORT_WIDTH - 20) / 2}&y=${(this.VIEWPORT_WIDTH - 20) / 2}&scale=1`;
    }
  }

  toggleOptions(isActive: Boolean) {
    this._toggleOptions = isActive ? !this._toggleOptions : false;
    document.querySelector("div.switch").classList.toggle("show");
    this.toggleOptions$.next(this._toggleOptions)
  }

  hoveredInitiatives: Initiative[];
  isNameOnly: boolean;
  selectedInitiative: Initiative;
  selectedInitiatives: Initiative[];
  selectedInitiativeX: Number;
  selectedInitiativeY: Number;
  isReadOnlyContextMenu: boolean;

  showContextMenu(context: { initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }) {
    this.isReadOnlyContextMenu = context.isReadOnlyContextMenu;
    this.selectedInitiatives = context.initiatives;
    this.selectedInitiativeX = context.x;
    this.selectedInitiativeY = context.y;
    this.cd.markForCheck();
  }

  showTooltip(nodes: Initiative[], isNameOnly: boolean) {
    this.hoveredInitiatives = nodes;
    this.isNameOnly = isNameOnly;
    this.cd.markForCheck();
  }

  zoomOut() {
    this.zoom$.next(0.8);
    this.analytics.eventTrack("Map", {
      action: "zoom out",
      mode: "button",
      team: this.team.name,
      teamId: this.team.team_id
    });
  }

  zoomIn() {
    this.zoom$.next(1.2);
    this.analytics.eventTrack("Map", {
      action: "zoom in",
      mode: "button",
      team: this.team.name,
      teamId: this.team.team_id
    });
  }

  resetZoom() {
    this.isReset$.next(true);
    this.analytics.eventTrack("Map", {
      action: "reset zoom",
      mode: "button",
      team: this.team.name,
      teamId: this.team.team_id
    });
  }

  fullScreen() {
    this.fullScreenLib.toggle(document.querySelector("#mapping-canvas"))
  }

  // changeFontColor(color: string) {
  //   this.fontColor$.next(color);
  //   this.settings.fontColor = color;
  //   localStorage.setItem(`map_settings_${this.datasetId}`, JSON.stringify(this.settings));
  //   // this.fontColor = color;
  //   this.analytics.eventTrack("Map", {
  //     action: "change font color",
  //     color: color,
  //     team: this.team.name,
  //     teamId: this.team.team_id
  //   });
  // }

  changeMapColor(color: string) {
    this.mapColor$.next(color);
    this.settings.mapColor = color;
    localStorage.setItem(`map_settings_${this.datasetId}`, JSON.stringify(this.settings));

    // localStorage.setItem("MAP_COLOR", `${color}`);
    // this.mapColor = color;
    this.analytics.eventTrack("Map", {
      action: "change map color",
      color: color,
      team: this.team.name,
      teamId: this.team.team_id
    });
  }

  addFirstNode() {
    this.addInitiative.emit({ node: this.initiative, subNode: new Initiative() });
    this.openTreePanel.emit(true);
    this.expandTree.emit(true);
    this.analytics.eventTrack("Map", { mode: "instruction", action: "add", team: this.team.name, teamId: this.team.team_id });
  }

  emitAddInitiative(context: { node: Initiative, subNode: Initiative }) {
    this.addInitiative.emit({ node: context.node, subNode: context.subNode })
  }

  emitOpenInitiative(node: Initiative) {
    this.showDetails.emit(node)
  }

  emitRemoveInitiative(node: Initiative) {
    this.removeInitiative.emit(node)
  }

  public broadcastTagsSettings(tags: SelectableTag[]) {
    this.applySettings.emit({ initiative: this.initiative, tags: tags });
  }

  public broadcastTagsSelection(tags: SelectableTag[]) {
    this.selectableTags$.next(tags);

    let tagsHash = tags
      .filter(t => t.isSelected === true)
      .map(t => t.shortid)
      .join(",");
    this.tagsFragment = `tags=${tagsHash}`;

    let ancient = this.uriService.parseFragment(this.route.snapshot.fragment);
    ancient.set("tags", tagsHash);
    location.hash = this.uriService.buildFragment(ancient);
  }

  zoomToInitiative(selected: Initiative) {
    this.zoomToInitiative$.next(selected);
  }

  goToUserSummary(selected: User) {
    this.isSearchToggled = true;
    this.isSearchDisabled = true;
    this.showTooltip(null, null);
    this.cd.markForCheck();
    this.router.navigateByUrl(`/map/${this.datasetId}/${this.slug}/summary?member=${selected.shortid}`);

  }

  sendSlackNotification(message: string) {
    this.isPrinting = true;
    this.hasNotified = false;
    this.cd.markForCheck()

    let svg = document.getElementById("map");
    let w = Number.parseFloat(svg.getAttribute("width"));
    let h = Number.parseFloat(svg.getAttribute("height"));
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
    let svgNode = this.downloadSvg(svg, "image.png", w, h);
    this.exportService.sendSlackNotification((<any>svgNode).outerHTML, this.datasetId, this.initiative, this.team.slack, message)
      .subscribe((result) => {
        this.isPrinting = false;
        this.hasNotified = true;
        this.intercom.trackEvent("Sharing map", { team: this.team.name, teamId: this.team.team_id, datasetId: this.datasetId, mapName: this.initiative.name });

        this.cd.markForCheck()
      },
        (err) => {
          this.hasConfigurationError = true;
          this.cd.markForCheck();
        })

  }

  // print() {
  //   // the canvg call that takes the svg xml and converts it to a canvas
  //   canvg("canvas", document.getElementById("svg_circles").outerHTML);

  //   // the canvas calls to output a png
  //   let canvas = document.getElementById("canvas");
  //   canvas.setAttribute("width", `${this.VIEWPORT_WIDTH}px`);
  //   canvas.setAttribute("height", `${this.VIEWPORT_HEIGHT}px`);
  //   let img = canvas.toDataURL("image/png");
  //   document.write("<img src=\"" + img + "\"/>");
  // }

  isPrinting: boolean;
  hasNotified: boolean;
  hasConfigurationError: boolean;
  isSharingToggled: boolean;

  // print() {
  //   this.isPrinting = true;
  //   this.cd.markForCheck()
  //   this.zoom$.next(0.8);
  //   this.changeFontSize(1)

  //   let svg = document.getElementById("svg_circles");
  //   let w = Number.parseFloat(svg.getAttribute("width"));
  //   let h = Number.parseFloat(svg.getAttribute("height"));
  //   svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  //   svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  //   let svgNode = this.downloadSvg(svg, "image.png", w, h);
  //   this.exportService.sendSlackNotification(svgNode.outerHTML, this.datasetId, this.datasetName, this.team.slack)
  //     .subscribe(() => { this.isPrinting = false; this.cd.markForCheck() })

  // }

  copyStylesInline(destinationNode: any, sourceNode: any) {
    let containerElements = ["svg", "g"];
    for (let cd = 0; cd < destinationNode.childNodes.length; cd++) {
      let child = destinationNode.childNodes[cd];

      if (child.tagName === "foreignObject") {
        if (child.childNodes[0].tagName === "DIV") {
          child.childNodes[0].setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
        }
      }

      if (containerElements.indexOf(child.tagName) !== -1) {
        this.copyStylesInline(child, sourceNode.childNodes[cd]);
        continue;
      }
      let style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
      if (style === "undefined" || style == null) continue;
      for (let st = 0; st < style.length; st++) {
        if (style[st] === "display" && style.getPropertyValue(style[st]) === "none") {
          child.style.setProperty(style[st], "block");

        }
        else if (style[st] === "opacity" && style.getPropertyValue(style[st]) === "0") {
          child.style.setProperty(style[st], "1");
        }
        // else if (style["fill"].includes("url(")) {
        //   child.style.setProperty("display", "none")
        // }
        else {
          child.style.setProperty(style[st], style.getPropertyValue(style[st]));
        }
        // child.style.setProperty(style[st], style.getPropertyValue(style[st]));
      }
    }
  }

  triggerDownload(imgURI: string, fileName: string) {
    let evt = new MouseEvent("click", {
      view: window,
      bubbles: false,
      cancelable: true
    });
    let a = document.createElement("a");
    // a.setAttribute("download", fileName);
    a.setAttribute("href", imgURI);
    a.setAttribute("target", "_blank");
    a.dispatchEvent(evt);
  }

  downloadSvg(svg: HTMLElement, fileName: string, width: number, height: number): Node {
    let copy = svg.cloneNode(true);
    this.copyStylesInline(copy, svg);
    return copy;
    /*
        let canvas = document.createElement("canvas");
        let WIDTH = width * 2;
        let HEIGHT = height * 3;
        canvas.setAttribute("width", WIDTH + "px");
        canvas.setAttribute("height", HEIGHT + "px");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let data = (new XMLSerializer()).serializeToString(copy);
        let DOMURL: any = window.URL || window;
        let img = new Image();
        img.crossOrigin = "Anonymous";
        img.setAttribute("crossOrigin", "Anonymous")
        let svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
        img.src = "data:image/svg+xml;utf8," + data;
        canvas.getContext("2d").drawImage(img, 0, 0, WIDTH, HEIGHT);
        let url = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        this.triggerDownload(url, `${Date.now()}-image.png`)
        */
  }
}
