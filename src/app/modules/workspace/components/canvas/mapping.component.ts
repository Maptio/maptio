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
import { ActivatedRoute, Router, Params } from "@angular/router";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { compact } from "lodash-es";
import { BehaviorSubject, ReplaySubject, Subject, Subscription } from "rxjs";

import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableTag, Tag } from "../../../../shared/model/tag.data";
import { Team } from "../../../../shared/model/team.data";
import { DataService } from "../../services/data.service";
import { UIService } from "../../services/ui.service";
import { URIService } from "../../../../shared/services/uri/uri.service";
import { IDataVisualizer } from "./mapping.interface";
import { MappingNetworkComponent } from "../../pages/network/mapping.network.component";
import { MappingTreeComponent } from "../../pages/tree/mapping.tree.component";
import { MappingZoomableComponent } from "../../pages/circles/mapping.zoomable.component";
import { ExportService } from "../../../../shared/services/export/export.service";
import { Intercom } from "ng-intercom";
import { User, SelectableUser } from "../../../../shared/model/user.data";
import { MappingSummaryComponent } from "../../pages/directory/summary.component";
import { SearchComponent } from "../searching/search.component";
import { environment } from "../../../../config/environment";
import * as screenfull from 'screenfull';
import { SlackService } from "../sharing/slack.service";
import { DataSet } from "../../../../shared/model/dataset.data";
import { MapSettingsService, MapSettings } from "../../services/map-settings.service";

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
  DEFAULT_TEXT_COLOR: string = environment.DEFAULT_MAP_TEXT_COLOR;
  DEFAULT_MAP_COLOR: string = environment.DEFAULT_MAP_BACKGOUND_COLOR;
  fullScreenLib: any = screenfull;
  isFullScreen: boolean;
  hoveredInitiatives: Initiative[];
  isNameOnly: boolean;
  selectedInitiative: Initiative;
  selectedInitiatives: Initiative[];
  selectedInitiativeX: Number;
  selectedInitiativeY: Number;
  isReadOnlyContextMenu: boolean;

  isPrinting: boolean;
  hasNotified: boolean;
  hasConfigurationError: boolean;
  isSharingToggled: boolean;

  public x: number;
  public y: number;
  public scale: number;
  public isSettingToggled: boolean;
  public isSearchToggled: boolean;
  public isMapSettingsDisabled: boolean;

  public zoom$: Subject<number>;
  public isReset$: Subject<boolean>;
  public selectableTags$: Subject<Array<Tag>>;
  public selectableUsers$: Subject<Array<User>>;

  public VIEWPORT_WIDTH: number;
  public VIEWPORT_HEIGHT: number;

  public datasetId: string;
  public initiative: Initiative;
  public flattenInitiative: Initiative[] = [];
  public team: Team;
  public dataset: DataSet;
  public members :User[];
  public slug: string;
  public tags: Array<SelectableTag>;
  public tagsFragment: string;

  public fontSize$: BehaviorSubject<number>;
  public mapColor$: BehaviorSubject<string>;
  public zoomToInitiative$: Subject<Initiative>;

  public subscription: Subscription;
  public instance: IDataVisualizer;
  public settings: MapSettings;

  isFiltersToggled: boolean = false;
  isSearchDisabled: boolean = false;

  @Input("isEmptyMap") isEmptyMap: Boolean;

  @Output("openDetails") openDetails = new EventEmitter<Initiative>();
  @Output("openUserSummary") openUserSummary = new EventEmitter<User>();

  @Output("addInitiative") addInitiative = new EventEmitter<{ node: Initiative, subNode: Initiative }>();
  @Output("removeInitiative") removeInitiative = new EventEmitter<Initiative>();
  @Output("moveInitiative") moveInitiative = new EventEmitter<{
    node: Initiative; from: Initiative; to: Initiative;
  }>();

  @Output("openTreePanel") openTreePanel = new EventEmitter<boolean>();
  @Output("expandTree") expandTree = new EventEmitter<boolean>();
  @Output("toggleSettingsPanel") toggleSettingsPanel = new EventEmitter<boolean>();
  @Output("toggleEditingPanelsVisibility") toggleEditingPanelsVisibility = new EventEmitter<Boolean>();


  constructor(
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private analytics: Angulartics2Mixpanel,
    private uriService: URIService,
    public uiService: UIService,
    private exportService: ExportService,
    private intercom: Intercom,
    private router: Router,
    private slackService: SlackService,
    private mapSettingsService: MapSettingsService
  ) {
    this.zoom$ = new Subject<number>();
    this.isReset$ = new Subject<boolean>();
    this.selectableTags$ = new ReplaySubject<Array<SelectableTag>>();
    this.selectableUsers$ = new ReplaySubject<Array<SelectableUser>>();
    this.mapColor$ = new BehaviorSubject<string>("");
    this.zoomToInitiative$ = new Subject();
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      if (params.reload) {
        this.changeMapColor(params.color);
      }
    });

    this.fullScreenLib.on("change", () => {
      this.isFullScreen = this.fullScreenLib.isFullscreen;

      if (document.querySelector("svg#map")) {
        document.querySelector("svg#map").setAttribute("width", `${this.uiService.getCanvasWidth()}`)
        document.querySelector("svg#map").setAttribute("height", `${this.uiService.getCanvasHeight()}`);
      }
      else {
        if (document.querySelector("#summary-canvas"))
          (document.querySelector("#summary-canvas") as HTMLElement).style.maxHeight = this.isFullScreen ? null : `${this.uiService.getCanvasHeight() * 0.95}px`;
        this.VIEWPORT_HEIGHT = this.uiService.getCanvasHeight();
        this.VIEWPORT_WIDTH = this.uiService.getCanvasWidth();

      }
      this.cd.markForCheck();
    })


  }

  onActivate(component: IDataVisualizer) {
    this.settings = this.mapSettingsService.get(this.datasetId);

    this.VIEWPORT_HEIGHT = this.uiService.getCanvasHeight();
    this.VIEWPORT_WIDTH = this.uiService.getCanvasWidth();

    component.showToolipOf$.asObservable().subscribe((tooltip: { initiatives: Initiative[], user:User}) => {
      if(tooltip.initiatives) this.openDetails.emit(tooltip.initiatives[0]);
      if(tooltip.user) this.openUserSummary.emit(tooltip.user);
    })

    component.showContextMenuOf$.asObservable().subscribe(node => {
      this.showContextMenu(node);
    })

    let f = this.route.snapshot.fragment ; //|| this.getFragment(component);
    this.x = Number.parseFloat(this.uriService.parseFragment(f).get("x"));
    this.y = Number.parseFloat(this.uriService.parseFragment(f).get("y"));
    this.scale = Number.parseFloat(
      this.uriService.parseFragment(f).get("scale")
    );

    component.width = this.VIEWPORT_WIDTH;
    component.height = this.VIEWPORT_HEIGHT;

    component.margin = 20;
    component.zoom$ = this.zoom$.asObservable();
    component.selectableTags$ = this.selectableTags$;
    component.selectableUsers$ = this.selectableUsers$;
    component.zoomInitiative$ = this.zoomToInitiative$;
    component.mapColor$ = this.mapColor$.asObservable();
    component.translateX = this.x;
    component.translateY = this.y;
    component.scale = this.scale;
    this.selectableTags$.next([]);
    this.selectableUsers$.next([]);
    this.zoomToInitiative$.next(null);

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
  }

  onDeactivate(component: any) {
    // this.settings = this.mapSettingsService.get(this.datasetId);

    // let position = this.uriService.parseFragment(this.route.snapshot.fragment);
    // position.delete("tags");
    // let lastPosition = this.uriService.buildFragment(position);

    // switch (component.constructor) {
    //   case MappingZoomableComponent:
    //     this.settings.lastPosition.circles = lastPosition;
    //     break;
    //   case MappingTreeComponent:
    //     this.settings.lastPosition.tree = lastPosition;
    //     break;
    //   case MappingNetworkComponent:
    //     this.settings.lastPosition.network = lastPosition;
    //     break;
    //   default:
    //     break;
    // }
    // this.mapSettingsService.set(this.datasetId, this.settings);

    // this.cd.markForCheck();
  }

  ngOnInit() {
    this.VIEWPORT_HEIGHT = this.uiService.getCanvasHeight();
    this.VIEWPORT_WIDTH = this.uiService.getCanvasWidth();


    this.subscription = this.route.params
      .do((params: Params) => {
        if (this.datasetId !== params["mapid"]) {
          this.showTooltip(null);
          this.showContextMenu({ initiatives: null, x: 0, y: 0, isReadOnlyContextMenu: null })

        }
        this.datasetId = params["mapid"];
        this.slug = params["mapslug"];
        this.settings = this.mapSettingsService.get(this.datasetId);
        this.mapColor$.next(this.settings.mapColor)

        this.cd.markForCheck();
      })
      .combineLatest(this.dataService.get())
      .map(data => data[1])
      .combineLatest(this.route.fragment, this.route.queryParams.distinct()) // PEFORMACE : with latest changes
      .subscribe(([data, fragment, queryParams]) => {
        if (!data.initiative.children || !data.initiative.children[0] || !data.initiative.children[0].children) {
          this.isFirstEdit = true;
          this.cd.markForCheck();
        }
        else {
          this.isFirstEdit = false;
          this.cd.markForCheck();
        }

        if (queryParams.id) {
          this.zoomToInitiative(new Initiative({ id: <number>queryParams.id }));
        }

        // let fragmentTags =
        //   this.uriService.parseFragment(fragment).has("tags") &&
        //     this.uriService.parseFragment(fragment).get("tags")
        //     ? this.uriService
        //       .parseFragment(fragment)
        //       .get("tags")
        //       .split(",")
        //       .map(
        //         (s: string) =>
        //           new SelectableTag({ shortid: s, isSelected: true })
        //       )
        //     : <SelectableTag[]>[];

        this.tags = compact<SelectableTag>(
          data.dataset.tags.map((dataTag: SelectableTag) => {
            // let searchTag = fragmentTags.find(
            //   t => t.shortid === dataTag.shortid
            // );
            return new SelectableTag({
              shortid: dataTag.shortid,
              name: dataTag.name,
              color: dataTag.color,
              isSelected: false
            });
          })
        );

        this.dataset = data.dataset;
        this.initiative = data.initiative;
        this.members = data.members;
        this.team = data.team;
        this.flattenInitiative = data.initiative.flatten();
        this.cd.markForCheck();
      });

    this.route.fragment.subscribe(f => { });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  // getLatestFragment(view: string) {
  //   switch (view) {
  //     case "circles":
  //       return `${this.settings.lastPosition.circles}&tags=${this.tagsFragment || ""}`
  //     case "tree":
  //       return `${this.settings.lastPosition.tree}&tags=${this.tagsFragment || ""}`
  //     case "network":
  //       return `${this.settings.lastPosition.network}&tags=${this.tagsFragment || ""}`
  //     default:
  //       return ""
  //   }
  // }

  // getFragment(component: IDataVisualizer) {
  //   switch (component.constructor) {
  //     case MappingZoomableComponent:
  //       return this.settings.lastPosition.circles || "";
  //     case MappingTreeComponent:
  //       return this.settings.lastPosition.tree || "";
  //     case MappingNetworkComponent:
  //       return this.settings.lastPosition.network || "";
  //     case MappingSummaryComponent:
  //       return `x=0&y=0&scale=1`;
  //     default:
  //       return ""
  //   }
  // }

  showContextMenu(context: { initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }) {
    this.isReadOnlyContextMenu = context.isReadOnlyContextMenu;
    this.selectedInitiatives = context.initiatives;
    this.selectedInitiativeX = context.x;
    this.selectedInitiativeY = context.y;
    this.cd.markForCheck();
  }

  showTooltip(nodes: Initiative[]) {
    if (nodes) this.emitOpenInitiative(nodes[0]);
    // this.hoveredInitiatives = nodes;
    // this.isNameOnly = isNameOnly;
    // this.cd.markForCheck();
  }

  zoomOut() {
    this.zoom$.next(1 / 3);
    this.analytics.eventTrack("Map", {
      action: "zoom out",
      mode: "button",
      team: this.team.name,
      teamId: this.team.team_id
    });
  }

  zoomIn() {
    this.zoom$.next(3);
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

  changeMapColor(color: string) {
    this.mapColor$.next(color);
    this.settings.mapColor = color;
    this.mapSettingsService.set(this.datasetId, this.settings)

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
    this.openDetails.emit(node)
  }

  emitRemoveInitiative(node: Initiative) {
    this.removeInitiative.emit(node)
  }

  broadcastTagsSelection(tags: Tag[]) {
    this.selectableTags$.next(tags);

    // let tagsHash = tags
    //   .filter(t => t.isSelected === true)
    //   .map(t => t.shortid)
    //   .join(",");
    // this.tagsFragment = `tags=${tagsHash}`;

    // let ancient = this.uriService.parseFragment(this.route.snapshot.fragment);
    // ancient.set("tags", tagsHash);
    // location.hash = this.uriService.buildFragment(ancient);
  }

  broadcastUsersSelection(user:User){

    this.selectableUsers$.next([user])
  }
  resetBroadcastUsersSelection(){
    this.selectableUsers$.next(this.members)
  }

  zoomToInitiative(selected: Initiative) {
    this.zoomToInitiative$.next(selected);
  }

  goToUserSummary(selected: User) {
    this.isSearchToggled = true;
    this.isSearchDisabled = true;
    this.showTooltip(null);
    this.cd.markForCheck();
    this.router.navigateByUrl(`/map/${this.datasetId}/${this.slug}/directory?member=${selected.shortid}`);

  }

  sendSlackNotification(message: string) {
    this.isPrinting = true;
    this.hasNotified = false;
    this.cd.markForCheck();

    this.slackService.sendNotification(
      message,
      document.getElementById("map"),
      this.dataset,
      this.team)
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
}
