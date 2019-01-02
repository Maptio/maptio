import { URIService } from "./../../../../shared/services/uri.service";
import { DataService } from "./../../../../shared/services/data.service";
import { UserFactory } from "./../../../../shared/services/user.factory";
import { Browsers, UIService } from "./../../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../../shared/services/ui/color.service";
import { Angulartics2Mixpanel } from "angulartics2";
import { Initiative } from "./../../../../shared/model/initiative.data";
import { SelectableUser } from "./../../../../shared/model/user.data";
import { SelectableTag, Tag } from "./../../../../shared/model/tag.data";
import { IDataVisualizer } from "./../../mapping/mapping.interface";
import { Observable, Subject, BehaviorSubject } from "rxjs/Rx";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import {
  Component,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { D3Service, D3, ScaleLinear, HSLColor, HierarchyCircularNode, ScaleLogarithmic } from "d3-ng2-service";
import { transition } from "d3-transition";
import { partition } from "lodash";
import { LoaderService } from "../../../../shared/services/loading/loader.service";
import { Team } from "../../../../shared/model/team.data";

@Component({
  selector: "zoomable",
  templateUrl: "./mapping.zoomable.component.html",
  styleUrls: ["./mapping.zoomable.component.css"],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingZoomableComponent implements IDataVisualizer {
  private d3: D3;
  private browser: Browsers;
  public datasetId: string;
  public teamId: string;
  public teamName: string;
  public width: number;
  public height: number;
  public translateX: number;
  public translateY: number;
  public scale: number;
  public tagsState: Array<SelectableTag>;

  public margin: number;
  public zoom$: Observable<number>;
  public selectableTags$: Observable<Array<SelectableTag>>;
  public selectableUsers$: Observable<Array<SelectableUser>>;
  public isReset$: Observable<boolean>;
  public fontSize$: Observable<number>;
  public fontColor$: Observable<string>;
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;
  public forceZoom$: Observable<Initiative>;
  public toggleOptions$: Observable<Boolean>;
  public isLocked$: Observable<boolean>;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  // public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
  public showContextMenuOf$: Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }> = new Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }>();
  public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();
  public moveInitiative$: Subject<{
    node: Initiative;
    from: Initiative;
    to: Initiative;
  }> = new Subject<{ node: Initiative; from: Initiative; to: Initiative }>();
  public closeEditingPanel$: Subject<boolean> = new Subject<boolean>();

  private zoomSubscription: Subscription;
  private dataSubscription: Subscription;
  private resetSubscription: Subscription;
  private fontSubscription: Subscription;
  private lockedSubscription: Subscription;
  private tagsSubscription: Subscription;
  private selectableTagsSubscription: Subscription;

  private zooming: any;

  public analytics: Angulartics2Mixpanel;

  public _isExplorationMode: boolean;

  private _isExplorationMode$: Subject<boolean> = new Subject<boolean>();

  private svg: any;
  private g: any;
  private diameter: number;
  private definitions: any;
  private fontSize: number;
  private fonts: ScaleLinear<number, number>;
  private outerFontScale: ScaleLogarithmic<number, number>;
  private innerFontScale: ScaleLogarithmic<number, number>;
  public isWaitingForDestinationNode: boolean = false;
  public isTooltipDescriptionVisible: boolean = false;
  public isFirstEditing: boolean = false;
  public isLocked: boolean;
  public isLoading: boolean;

  public selectedNode: Initiative;
  public selectedNodeParent: Initiative;
  public hoveredNode: Initiative;

  private color: ScaleLinear<HSLColor, string>;
  public slug: string;

  CIRCLE_RADIUS: number = 16;
  MAX_TEXT_LENGTH = 35;
  TRANSITION_DURATION = 750;
  ZOOMING_TRANSITION_DURATION = 250;
  TRANSITION_OPACITY = 750;
  RATIO_FOR_VISIBILITY = 0.08;
  FADED_OPACITY = 0.1;
  MAX_NUMBER_LETTERS_PER_CIRCLE = 15;
  MIN_TEXTBOX_WIDTH = 100;
  T: any;

  POSITION_INITIATIVE_NAME = { x: 0.9, y: 0.1, fontRatio: 1 };
  POSITION_TAGS_NAME = { x: 0, y: 0.3, fontRatio: 0.65 };
  POSITION_ACCOUNTABLE_NAME = { x: 0, y: 0.45, fontRatio: 0.9 };
  DEFAULT_PICTURE_ANGLE = Math.PI - Math.PI * 36 / 180;

  counter: number = 0;

  constructor(
    public d3Service: D3Service,
    public colorService: ColorService,
    public uiService: UIService,
    public router: Router,
    private route: ActivatedRoute,
    private userFactory: UserFactory,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private uriService: URIService,
    private loaderService: LoaderService
  ) {
    this.d3 = d3Service.getD3();
    this.T = this.d3.transition(null).duration(this.TRANSITION_DURATION);
  }

  ngOnInit() {

    this.loaderService.show();
    this.init();
    this.dataSubscription = this.dataService
      .get()
      .combineLatest(this.mapColor$, this.route.queryParams)
      .do((complexData: [any, string, Params]) => {
        if (complexData[0].dataset.datasetId !== this.datasetId) {
          this.counter = 0;
        }
      })
      .subscribe((complexData: [any, string, Params]) => {
        let data = <any>complexData[0].initiative;
        this.datasetId = complexData[0].dataset.datasetId;

        this._isExplorationMode = JSON.parse(localStorage.getItem(`map_settings_${this.datasetId}`)).explorationMode;
        this._isExplorationMode$.next(this._isExplorationMode);
        this.cd.markForCheck();

        this.slug = data.getSlug();
        this.loaderService.show();
        let nodes = this.update(data, complexData[1], !this._isExplorationMode, this.counter === 0);
        if (complexData[2].id) {
          if (nodes.find((n: any) => n.data.id.toString() === complexData[2].id.toString())) {
            let n = <Initiative>nodes.filter((n: any) => n.data.id.toString() === complexData[2].id.toString())[0].data;
            this.showDetailsOf$.next(n);
            this.svg.select(`circle.node.initiative-map[id="${complexData[2].id}"]`).dispatch("click");
            // remove the location.search without reload
            window.history.pushState("", "", `${location.protocol}//${location.host}/${location.pathname}${location.hash}`)

          }
        }
        this.counter += 1;
        this.loaderService.hide();
        this.analytics.eventTrack("Map", {
          action: "viewing",
          view: "initiatives",
          team: (<Team>complexData[0].team).name,
          teamId: (<Team>complexData[0].team).team_id
        });
        this.isLoading = false;
        this.cd.markForCheck();
      },
        (err) => console.error(err));
    this.selectableTags$.subscribe(tags => this.tagsState = tags)
  }

  public switch() {
    this._isExplorationMode = !this._isExplorationMode;

    let settings = JSON.parse(localStorage.getItem(`map_settings_${this.datasetId}`));
    settings.explorationMode = this._isExplorationMode;
    localStorage.setItem(`map_settings_${this.datasetId}`, JSON.stringify(settings));

    this._isExplorationMode$.next(this._isExplorationMode);
    this.ngOnInit();
  }

  ngOnDestroy() {
    if (this.zoomSubscription) {
      this.zoomSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.resetSubscription) {
      this.resetSubscription.unsubscribe();
    }
    if (this.fontSubscription) {
      this.fontSubscription.unsubscribe();
    }
    if (this.lockedSubscription) {
      this.lockedSubscription.unsubscribe();
    }
    if (this.tagsSubscription) {
      this.tagsSubscription.unsubscribe();
    }
    if (this.selectableTagsSubscription) {
      this.selectableTagsSubscription.unsubscribe();
    }
  }

  init() {
    this.uiService.clean();
    const d3 = this.d3;

    const margin = { top: 20, right: 20, bottom: 20, left: 0 };
    const width: number = this.width - margin.left - margin.right,
      height: number = this.height - margin.top - margin.bottom;
    const svg: any = d3
      .select("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .attr("version", "1.1"),
      diameter = +width,
      g = svg
        .append("g")
        .attr(
          "transform",
          `translate(${diameter / 2 + margin.left}, ${diameter / 2}) scale(${this.scale})`
        ),
      definitions = svg.append("svg:defs");

    // g.append("g").attr("class", "paths");
    this.zooming = d3
      .zoom()
      .on("zoom", zoomed)
      .on("end", (): void => {
        this.adjustViewToZoomEvent(g, d3.event);
        const transform = d3.event.transform;
        svg.attr("scale", transform.k);
        const tagFragment: string = this.tagsState
          .filter(t => t.isSelected)
          .map(t => t.shortid)
          .join(",");
        this.loaderService.hide();
        location.hash = this.uriService.buildFragment(
          new Map([
            ["x", transform.x],
            ["y", transform.y],
            ["scale", transform.k],
            ["tags", tagFragment]
          ])
        );

        this.translateX = transform.x;
        this.translateY = transform.y;
        this.scale = transform.k;
      });

    function zoomed() {
      g.attr("transform", d3.event.transform);
    }

    this.resetSubscription = this.isReset$.filter(r => r).subscribe(isReset => {
      svg.transition().duration(this.ZOOMING_TRANSITION_DURATION).call(
        this.zooming.transform,
        d3.zoomIdentity.translate(
          diameter / 2 + margin.left,
          diameter / 2 + margin.top
        )
      );
    });

    this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
      try {
        // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
        if (zf) {
          this.zooming.scaleBy(svg.transition().duration(this.ZOOMING_TRANSITION_DURATION), zf);
        } else {
          svg.transition().duration(this.ZOOMING_TRANSITION_DURATION).call(
            this.zooming.transform,
            d3.zoomIdentity.translate(this.translateX, this.translateY)
          );
        }
      } catch (error) { }
    });

    this.fontSubscription = this.fontSize$.combineLatest(this.fontColor$).subscribe((format: [number, string]) => {
      // font size
      svg.attr("font-size", format[0] + "rem");
      svg.attr("data-font-multiplier", format[0]);
      // svg.selectAll("text").style("font-size", format[0] + "rem");
      svg.selectAll("foreignObject.name")
        .each(function (d: any) {
          d3.select(this).select("div").style("font-size", `${d.r * d.k * 2 * 0.95 / 15 * format[0] / 16}rem`)
        });

      svg.selectAll("text.name.with-children")
        .each(function (d: any) {
          d3.select(this).style("font-size", `${format[0]}rem`)
        });
      // svg.selectAll("text.accountable")
      //   .attr("font-size", function (d: any) {
      //     let multiplier = svg.attr("data-font-multiplier");
      //     return `${d.r * d.k * 2 * 0.95 / 15 * 0.9 * multiplier / 16}rem`
      //   })
      // svg.selectAll("text.tags")
      //   .attr("font-size", function (d: any) {
      //     let multiplier = svg.attr("data-font-multiplier");
      //     return `${d.r * d.k * 2 * 0.95 / 15 * 0.65 * multiplier / 16}rem`
      //   })

      this.fontSize = format[0];
      // font color
      svg.style("fill", format[1]);
      svg.selectAll("text").style("fill", format[1]);
    });

    let [clearSearchInitiative, highlightInitiative] = this.zoomInitiative$.partition(node => node === null);
    clearSearchInitiative.subscribe(() => {
      svg.select("circle.node--root").dispatch("click");
    })
    highlightInitiative.subscribe(node => {
      svg.select(`circle.node.initiative-map[id="${node.id}"]`).dispatch("click");
    });

    this.selectableTagsSubscription = this.selectableTags$.subscribe(tags => {
      this.tagsState = tags;
      let [selectedTags, unselectedTags] = partition(tags, t => t.isSelected);
      let uiService = this.uiService
      let FADED_OPACITY = this.FADED_OPACITY;
      function filterByTags(d: any): number {
        if (selectedTags.length === 0) return 1;
        return uiService.filter(selectedTags, unselectedTags, d.data.tags.map((t: Tag) => t.shortid))
          ? 1
          : FADED_OPACITY
      }
      g.selectAll("g.node.initiative-map").style("opacity", function (d: any) {
        return filterByTags(d)
      });
    });

    const maxOuterFontSize = 16;
    const maxInnerFontSize = 10;
    const defaultDomain = [0.5, 5];
    this.outerFontScale = d3.scaleLog().domain(defaultDomain).range([maxOuterFontSize, 0]);
    this.innerFontScale = d3.scaleLog().domain(defaultDomain).range([maxInnerFontSize, 0]);

    this.svg = svg;
    this.g = g;
    this.browser = this.uiService.getBrowser();
    // this.color = color;
    this.diameter = diameter;
    this.definitions = definitions;
  }

  adjustViewToZoomEvent(g: any, event: any): void {
    if (event.sourceEvent) return;

    const select: Function = this.d3.select;
    
    const domain: Array<number> = this.zooming.scaleExtent() ? this.zooming.scaleExtent() : [0.5, 5];
    this.outerFontScale.domain(domain);
    this.innerFontScale.domain(domain);

    const zoomFactor: number = event.transform.k > 1 ? event.transform.k : 1;
    const innerFontSize: number = this.innerFontScale(zoomFactor);
    const outerFontSize: number = this.outerFontScale(zoomFactor);
    

    g.selectAll(".node.no-children")
      .each(function(d: any): void {
        select(this).select("foreignObject div")
          .transition()
          .style("opacity", 0)
          .on("end", function(): void {
            select(this)
              .style("font-size", `${innerFontSize}px`)
              .transition()
              .style("opacity", 1);
          });
      });

    g.selectAll("text.name.with-children")
      .transition()
      .style("opacity", 0)
      .on("end", function(d: any): void {
        select(this)
          .style("font-size", `${outerFontSize}px`)
          .transition()
          .style("opacity", 1);
      });

    const DEFAULT_PICTURE_ANGLE: number = this.DEFAULT_PICTURE_ANGLE;
    const accountableCircles = g.selectAll("circle.accountable")
      .transition()
      .style("opacity", 0)
      .on("end", function(): void {
        const accountableZoomFactor = zoomFactor > 1.7 ? 1.7 : zoomFactor;
        select(this)
          .attr("cx", (d: any): number => {
            return d.children
              ? Math.cos(DEFAULT_PICTURE_ANGLE) * (d.r * accountableZoomFactor) - 12
              : 0;
          })
          .attr("cy", (d: any): number => {
            return d.children
              ? -Math.sin(DEFAULT_PICTURE_ANGLE) * (d.r * accountableZoomFactor) + 12
              : -d.r * accountableZoomFactor * 0.9;
          })
          .attr("transform", `scale(${1 / accountableZoomFactor})`) 
          .transition()
          .style("opacity", 1);
      });
  }

  getTags() {
    return this.tagsState;
  }

  private _lastZoomedCircle: any;

  getLastZoomedCircle() {
    return this._lastZoomedCircle;
  }

  setLastZoomedCircle(circle: any) {
    this._lastZoomedCircle = circle;
  }

  update(data: Initiative, seedColor: string, isFullDisplayMode: boolean, isFirstLoad: boolean): HierarchyCircularNode<{}>[] {
    if (this.d3.selectAll("g").empty()) {
      this.init();
    }

    let d3 = this.d3;
    let diameter = this.diameter;
    let margin = this.margin;
    let g = this.g;
    let svg = this.svg;
    let scale = this.scale;
    let translateX = this.translateX;
    let translateY = this.translateY;
    let width = this.width;
    let definitions = this.definitions;
    let uiService = this.uiService;
    let fontSize = this.fontSize;
    let zooming = this.zooming;
    let TOOLTIP_PADDING = 20;
    let CIRCLE_RADIUS = this.CIRCLE_RADIUS;
    let TRANSITION_DURATION = this.TRANSITION_DURATION;
    // let fonts = this.fonts;
    let showDetailsOf$ = this.showDetailsOf$;
    let showToolipOf$ = this.showToolipOf$;
    let showContextMenuOf$ = this.showContextMenuOf$;
    let browser = this.browser;
    let datasetId = this.datasetId;
    let datasetSlug = this.slug;
    let router = this.router;
    let getTags = this.getTags.bind(this);
    let getLastZoomedCircle = this.getLastZoomedCircle.bind(this);
    let setLastZoomedCircle = this.setLastZoomedCircle.bind(this);
    let zoomInitiative$ = this.zoomInitiative$;
    let POSITION_INITIATIVE_NAME = this.POSITION_INITIATIVE_NAME;
    let POSITION_TAGS_NAME = this.POSITION_TAGS_NAME;
    let POSITION_ACCOUNTABLE_NAME = this.POSITION_ACCOUNTABLE_NAME;
    let DEFAULT_PICTURE_ANGLE = this.DEFAULT_PICTURE_ANGLE;
    let PADDING_CIRCLE = 20
    let MAX_NUMBER_LETTERS_PER_CIRCLE = this.MAX_NUMBER_LETTERS_PER_CIRCLE;
    let MIN_TEXTBOX_WIDTH = this.MIN_TEXTBOX_WIDTH;
    let FADED_OPACITY = this.FADED_OPACITY;

    let TRANSITION_1x = d3.transition("").duration(TRANSITION_DURATION)
    let TRANSITION_2x = d3.transition("").duration(TRANSITION_DURATION * 1)
    let TRANSITION_3x = d3.transition("").duration(TRANSITION_DURATION * 1)

    // let TRANSITION_DELETE = d3.transition("deleting").duration(TRANSITION_DURATION)
    // let TRANSITION_ADD_FADEIN = d3.transition("adding_fadein").duration(TRANSITION_DURATION)
    // let TRANSITION_ADD_FADEOUT = d3.transition("adding_fadeout").duration(TRANSITION_DURATION * 3)
    let COLOR_ADD_CIRCLE = getComputedStyle(document.body).getPropertyValue('--maptio-blue')
    let COLOR_DELETE_CIRCLE = getComputedStyle(document.body).getPropertyValue('--maptio-red')

    const pack = d3
      .pack()
      .size([diameter - margin, diameter - margin])
      .padding(function (d: any) {
        return PADDING_CIRCLE;
      });

    const root: any = d3
      .hierarchy(data)
      .sum(function (d) {
        return (d.accountable ? 1 : 0) + (d.helpers ? d.helpers.length : 0) + 1;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      });

    if (isFirstLoad) {
      setLastZoomedCircle(root);
    }

    let depth = 0;
    root.eachAfter((n: any): void => {
      depth = depth > n.depth ? depth : n.depth;
    });

    const fonts = this.colorService.getFontSizeRange(depth, fontSize);
    const color = this.colorService.getColorRange(depth, seedColor);

    const focus = root,
      nodes: Array<any> = pack(root).descendants();
    let view: any;

    const minRadius: number = d3.min(nodes.map(node => node.r));
    this.zooming.scaleExtent([0.5, getViewScaleForRadius(minRadius)]);

    function getViewScaleForRadius(radius: number): number {
      return (width - (margin * 2)) / (radius * 2);
    }

    function getDepthDifference(d: any): number {
      return d.depth - focus.depth;
    }

    function isBranchDisplayed(d: any): boolean {
      return isFullDisplayMode ? true : getDepthDifference(d) <= 3;
    }

    function isLeafDisplayed(d: any): boolean {
      return isFullDisplayMode ? true : getDepthDifference(d) <= 2;
    }

    function toREM(pixels: number) {
      return pixels / 16;
    }

    buildPatterns();

    let path = buildPaths();

    let initiativeWithChildren = g
      .selectAll("g.node.initiative-map.with-children")
      .data(nodes.filter(d => d.children), function (d: any) {
        return `${d.data.id}`;
      });

    let initiativeNoChildren = g
      .selectAll("g.node.initiative-map.no-children")
      .data(nodes.filter(d => !d.children), function (d: any) {
        return `${d.data.id}`;
      });


    exitWithAnimations(initiativeNoChildren);
    exitWithAnimations(initiativeWithChildren);

    let initiativeWithChildrenEnter = initiativeWithChildren.enter().append("g");
    let initiativeNoChildrenEnter = initiativeNoChildren.enter().append("g");

    enterWithAnimations(initiativeWithChildrenEnter, "with-children");
    enterWithAnimations(initiativeNoChildrenEnter, "no-children");

    // initiativeWithChildrenEnter.append("path").attr("class", "node");


    initiativeWithChildrenEnter.append("text").attr("class", "name with-children").classed("initiative-map", true);
    initiativeNoChildrenEnter.append("foreignObject").attr("class", "name no-children").classed("initiative-map", true);

    // initiativeNoChildrenEnter.append("text").attr("class", "tags no-children").classed("initiative-map", true);

    initiativeWithChildrenEnter.append("circle").attr("class", "accountable with-children").classed("initiative-map", true);
    initiativeNoChildrenEnter.append("circle").attr("class", "accountable no-children").classed("initiative-map", true);

    // initiativeNoChildrenEnter.append("text").attr("class", "accountable no-children").classed("initiative-map", true)

    initiativeWithChildren = initiativeWithChildrenEnter.merge(initiativeWithChildren);
    initiativeNoChildren = initiativeNoChildrenEnter.merge(initiativeNoChildren);

    g.selectAll("g.node").sort((a: any, b: any) => {
      return b.height - a.height;
    });

    addCircle(initiativeWithChildren)
    addCircle(initiativeNoChildren)

    // let path = g.selectAll("path.node")
    //   .attr("id", function (d: any) {
    //     return `path${d.data.id}`;
    //   })
    //   .style("stroke", "none")
    //   .style("fill", "none")
    //   .attr("d", function (d: any, i: number) {
    //     let radius = d.r * d.k + 1;
    //     return uiService.getCircularPath(radius, -radius, 0);
    //   });

    let circle = g.selectAll("circle.node")

    let textAround = initiativeWithChildren.select("text.name.with-children")
      .attr("id", function (d: any) {
        return `${d.data.id}`;
      })
      // .style("pointer-events", "none")
      .style("opacity", function (d: any) {
        return isBranchDisplayed(d) ? 1 : 0;
      })
      .style("display", function (d: any) {
        return d !== root
          ? isBranchDisplayed(d) ? "inline" : "none"
          : "none";
      })
      .style("font-size", function (d: any) {
        return `1rem`;
      })
      .html(function (d: any) {
        let radius = d.r * d.k + 1;
        return browser === Browsers.Firefox
          ? `<textPath path="${uiService.getCircularPath(radius, -radius, 0)}" startOffset="10%">
                  <tspan>${d.data.name || ""}</tspan>
                  </textPath>`
          : `<textPath xlink:href="#path${d.data.id}" startOffset="10%">
                  <tspan>${d.data.name || ""}</tspan>
                  </textPath>`;
      });


    const initiativeName = initiativeNoChildren.select("foreignObject.name.no-children")
      .attr("id", function (d: any) {
        return `${d.data.id}`;
      })
      .classed("initiative-map", true)
      .attr("x", function (d: any) {
        return -d.r * POSITION_INITIATIVE_NAME.x;
      })
      .attr("y", function (d: any) {
        return -d.r * POSITION_INITIATIVE_NAME.y;
      })
      .attr("width", function (d: any) { return d.r * 2 * 0.95 })
      .attr("height", function (d: any) { return d.r * 2 * 0.5 })
      .style("display", "inline")
      .style("opacity", function (d: any) {
        return isLeafDisplayed(d) ? 1 : 0;
      })
      .style("pointer-events", function (d: any) {
        return "none"; // isLeafDisplayed(d) ? "auto" : "none";
      })
      .html(function (d: any) {
        let fs = `${toREM(d.r * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE)}rem`;
        return `<div style="font-size: ${fs}; background: none; display: block;pointer-events: none; overflow:hidden; height:100%;line-height:100%">${d.data.name || '(Empty)'}</div>`;
      })

    /*
  let tagsName = initiativeNoChildren.select("text.tags")
    .attr("id", function (d: any) {
      return `${d.data.id}`;
    })
    .style("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("x", function (d: any) {
      return -d.r * POSITION_TAGS_NAME.x;
    })
    .attr("y", function (d: any) {
      return -d.r * POSITION_TAGS_NAME.y;
    })
    .attr("font-size", function (d: any) {
      let multiplier = svg.attr("data-font-multiplier");
      return `${toREM(d.r * d.k * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE * POSITION_TAGS_NAME.fontRatio * multiplier)}rem`

    })
    .style("display", "inline")
    .style("opacity", function (d: any) {
      return isLeafDisplayed(d) ? 1 : 0;
    })
    .style("pointer-events", function (d: any) {
      return isLeafDisplayed(d) ? "auto" : "none";
    })
    .html(function (d: any) {
      return d.data.tags.map((tag: Tag) => `<tspan fill="${tag.color}" class="dot-tags">&#xf02b</tspan><tspan fill="${tag.color}">${tag.name}</tspan>`).join(" ");
    });
*/

    let accountablePictureWithChildren = initiativeWithChildren.select("circle.accountable.with-children")
      .attr("pointer-events", "none")
      .attr("fill", function (d: any) {
        return d.data.accountable ? "url('#image" + d.data.id + "')" : "transparent";
      })
      .style("fill-opacity", function (d: any) {
        return isBranchDisplayed(d) ? 1 : 0;
      })
      .style("display", function (d: any) {
        return d !== root
          ? isBranchDisplayed(d) ? "inline" : "none"
          : "none";
      });

    let accountablePictureWithoutChildren = initiativeNoChildren.select("circle.accountable.no-children")
      .attr("pointer-events", "none")
      .attr("fill", function (d: any) {
        return d.data.accountable ? "url('#image" + d.data.id + "')" : "transparent";
      })
      .style("opacity", function (d: any) {
        return isLeafDisplayed(d) ? 1 : 0;
      });
    /*
        let accountableName = initiativeNoChildren.select("text.accountable.no-children")
          .attr("text-anchor", "middle")
          .style("pointer-events", "none")
          .attr("id", function (d: any) {
            return `${d.data.id}`;
          })
          .style("display", "inline")
          .style("opacity", function (d: any) {
            return isLeafDisplayed(d) ? 1 : 0;
          })
          .attr("font-size", function (d: any) {
            let multiplier = svg.attr("data-font-multiplier");
            return `${toREM(d.r * d.k * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE * POSITION_ACCOUNTABLE_NAME.fontRatio * multiplier)}rem`
    
          })
          .attr("x", function (d: any) {
            return d.r * POSITION_ACCOUNTABLE_NAME.x;
          })
          .attr("y", function (d: any) {
            return Math.max(-d.r * POSITION_ACCOUNTABLE_NAME.y, -d.r + CIRCLE_RADIUS * 2 - 3);
          })
          .text(function (d: any) {
            return d.data.accountable ? d.data.accountable.name : "";
          });
    */
    let node = g.selectAll("g.node");

    svg.on("click", (): void => {
      zoom(root);
    });

    initMapElementsAtPosition([getLastZoomedCircle().x, getLastZoomedCircle().y, getLastZoomedCircle().r * 2 + margin]);
    if (getLastZoomedCircle().data.id !== root.id && !isFirstLoad) {
      zoom(getLastZoomedCircle())
    }

    try {
      // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
      // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
      svg.call(
        this.zooming.transform,
        d3.zoomIdentity
          .translate(this.translateX, this.translateY)
          .scale(this.scale)
      );
      svg.call(this.zooming);
    } catch (error) { console.log(error); }

    return nodes;

    function getClickedElementCoordinates(clickedElement: any, newScale: number): Array<number> {
      let clickedX = 0;
      let clickedY = 0;
      if (clickedElement && clickedElement.transform && clickedElement.transform.baseVal.length > 0) {
        clickedX = clickedElement.transform.baseVal[0].matrix.e * newScale;
        clickedY = clickedElement.transform.baseVal[0].matrix.f * newScale;
        clickedX -= margin;
        clickedY -= 50;
      }
      return [clickedX, clickedY];
    }

    function zoom(focus: any, clickedElement?: any): void {
      setLastZoomedCircle(focus);

      const newScale: number = getViewScaleForRadius(focus.r);
      const coordinates: Array<number> = getClickedElementCoordinates(clickedElement, newScale);

      svg.transition().duration(TRANSITION_DURATION).call(
        zooming.transform,
        d3.zoomIdentity.translate(
          view[0] - coordinates[0],
          view[1] - coordinates[1]
        )
        .scale(newScale)
      );
    }

    function initMapElementsAtPosition(v: any) {
      const k: number = diameter / v[2];
      view = v;

      node
        .transition()
        .duration((d: any): number => d.children ? TRANSITION_DURATION / 5 : TRANSITION_DURATION / 5)
        .attr("transform", (d: any): string => `translate(${(d.x - v[0]) * k}, ${(d.y - v[1]) * k})`);

      textAround
        .on("contextmenu", function (d: any): void {
          d3.event.preventDefault();
          let mouse = d3.mouse(this);
          d3.select(`circle.node[id="${d.data.id}"]`).dispatch("contextmenu", { bubbles: true, cancelable: true, detail: { position: [mouse[0], mouse[1]] } });
        })
        .on("mouseover", function (d: any) {
          d3.select(`circle.node[id="${d.data.id}"]`).dispatch("mouseover");
        })
        .on("mouseout", function (d: any) {
          d3.select(`circle.node[id="${d.data.id}"]`).dispatch("mouseout");
        });

      circle
        .attr("r", function (d: any) {
          return d.r * k;
        })
        .style("stroke", function (d: any) {
          return d.children
            ? color(d.depth)
            : !d.children && d.parent === root ? d3.color(color(d.depth)).darker(1).toString() : null;
        })
        .style("fill", function (d: any) {
          return d.children
            ? color(d.depth)
            : !d.children && d.parent === root ? color(d.depth) : null;
        })
        .style("fill-opacity", function (d: any) {
          return d.children
            ? 0.1
            : !d.children && d.parent === root ? 0.1 : 1;
        })
        .style("stroke-opacity", 1)
        .each((d: any) => (d.k = k))
        .on("mouseover", function (d: any) {
          let circle = d3.select(this);
          let initiative = d.data;
          d3.event.stopPropagation();
          d3.event.preventDefault();
          showToolipOf$.next({ initiatives: [initiative], isNameOnly: false });
          d3.select(this)
            .style("stroke", d3.color(seedColor).darker(1).toString())
            .style("fill", d3.color(seedColor).darker(1).toString())
            .style("fill-opacity", 1)
            .style("stroke-width", "3px");

          d3.selectAll(`circle[parent-id="${d.data.id}"]`)
            .style("fill-opacity", 1);

          // d3.select(".tooltip-menu")
          //   .on("mouseover", function (d: any) {
          //     showToolipOf$.next({ initiatives: [initiative], isNameOnly: false });
          //     circle.dispatch("mouseover");
          //   })
          //   .on("mouseout", function (d: any) {
          //     showToolipOf$.next({ initiatives: null, isNameOnly: false });
          //     circle.dispatch("mouseout");
          //   })

        })
        .on("mouseout", function (d: any) {
          showToolipOf$.next({ initiatives: null, isNameOnly: false });
          showContextMenuOf$.next({ initiatives: null, x: 0, y: 0, isReadOnlyContextMenu: false })
          d3.select(this)
            .style("stroke", function (d: any) {
              return d.children
                ? color(d.depth)
                : !d.children && d.parent === root ? color(d.depth) : null;
            })
            .style("fill", function (d: any) {
              return d.children
                ? color(d.depth)
                : !d.children && d.parent === root ? color(d.depth) : null;
            })
            .style("fill-opacity", function (d: any) {
              return d.children
                ? 0.1
                : !d.children && d.parent === root ? 0.1 : 1;
            })
            .style("stroke-width", "initial")
            .style("stroke-opacity", 1)
          d3.selectAll(`circle[parent-id="${d.data.id}"]`)
            .style("fill-opacity", function (d: any) {
              return d.children
                ? 0.1
                : !d.children && d.parent === root ? 0.1 : 1;
            })
        })
        .on("contextmenu", function (d: any) {
          d3.event.preventDefault();
          let mousePosition;

          if (Number.isNaN(d3.mouse(this)[0]) || Number.isNaN(d3.mouse[1])) {
            mousePosition = d3.event.detail.position
          }
          else {
            mousePosition = d3.mouse(this);
          }
          let matrix = this.getCTM().translate(
            +this.getAttribute("cx"),
            +this.getAttribute("cy")
          );

          let mouse = { x: mousePosition[0] + 3, y: mousePosition[1] + 3 }
          let initiative = d.data;
          let circle = d3.select(this);
          showContextMenuOf$.next({
            initiatives: [initiative],
            x: uiService.getContextMenuCoordinates(mouse, matrix).x,
            y: uiService.getContextMenuCoordinates(mouse, matrix).y,
            isReadOnlyContextMenu: false
          });

          d3.select(".context-menu")
            .on("mouseenter", function (d: any) {
              showContextMenuOf$.next({
                initiatives: [initiative],
                x: uiService.getContextMenuCoordinates(mouse, matrix).x,
                y: uiService.getContextMenuCoordinates(mouse, matrix).y,
                isReadOnlyContextMenu: false
              });
              circle.dispatch("mouseover");
            })
            .on("mouseleave", function (d: any) {
              showContextMenuOf$.next({
                initiatives: null,
                x: 0,
                y: 0,
                isReadOnlyContextMenu: false
              });
              circle.dispatch("mouseout");
            })

        });

      g.selectAll("circle.accountable")
        .attr("r", function (d: any) {
          return d.r * k > CIRCLE_RADIUS ? `${CIRCLE_RADIUS}px` : `${d.r * 0.3}px`;
        })
        .attr("cx", function (d: any) {
          return d.children
            ? Math.cos(DEFAULT_PICTURE_ANGLE) * (d.r * k) - 12
            : 0;
        })
        .attr("cy", function (d: any) {
          return d.children
            ? -Math.sin(DEFAULT_PICTURE_ANGLE) * (d.r * k) + 12
            : -d.r * k * 0.9;
        });
    }

    function addCircle(groups: any): void {
      groups.select("circle")
        .attr("class", (d: any): string => {
          return d.parent
            ? d.children ? "node" : "node node--leaf"
            : "node node--root";
        })
        .classed("initiative-map", true)
        .each((d: any) => d.k = 1)
        .attr("id", (d: any): string => `${d.data.id}`)
        .classed("with-border", (d: any): boolean => !d.children && d.parent === root)
        .on("click", function (d: any, index: number, elements: Array<HTMLElement>): void {
          // if (isFullDisplayMode) return;
          if (getLastZoomedCircle().data.id === d.data.id) {
            setLastZoomedCircle(root);
            zoom(root);
          } else {
            setLastZoomedCircle(d);
            zoom(d, this.parentElement);
          }
          d3.event.stopPropagation();
        })
    }

    function exitWithAnimations(groups: any) {
      groups.exit().select("text")
        .remove();
      groups.exit().select("foreignObject")
        .remove();
      groups.exit().select("circle.accountable")
        .remove();
      groups.exit().select("circle.node")
        .classed("node--leaf", false)
        .classed("deleting", true)
        .attr("r", (d: any) => d.r)
        .transition(TRANSITION_1x)
        .style("stroke", COLOR_DELETE_CIRCLE)
        .style("fill", COLOR_DELETE_CIRCLE)
        .transition(TRANSITION_1x)
        .attr("r", 0)
        .transition(TRANSITION_1x)
        .remove();
      groups.exit().transition(TRANSITION_1x).remove();
    }

    function enterWithAnimations(groups: any, className: string) {
      groups
        .attr("class", function (d: any) {
          return d.parent
            ? d.children ? "node" : "node node--leaf"
            : "node node--root";
        })
        .classed(className, true)
        .classed("initiative-map", true)
        .attr("id", function (d: any) {
          return `${d.data.id}`;
        })
        ;

      groups.append("circle")
        .style("fill", function (d: any) {
          return d.children
            ? color(d.depth)
            : !d.children && d.parent === root ? color(d.depth) : null;
        })
        .transition(TRANSITION_2x)
        .style("fill", COLOR_ADD_CIRCLE)
        .attr("r", (d: any) => d.r)
        .transition(TRANSITION_1x)
        .style("fill", function (d: any) {
          return d.children
            ? color(d.depth)
            : !d.children && d.parent === root ? color(d.depth) : null;
        })
    }


    function buildPaths() {
      let path = svg.select("defs")
        .selectAll("path")
        .data(nodes, function (d: any) {
          return d.data.id;
        })

      path.exit().remove();
      path = path.enter()
        .append("path")
        .merge(path)
        .attr("id", function (d: any) {
          return `path${d.data.id}`;
        })
        // .style("stroke", "none")
        // .style("fill", "none")
        .attr("d", function (d: any, i: number) {
          let radius = d.r + 1;
          return uiService.getCircularPath(radius, -radius, 0);
        });

      return path;
    }


    function buildPatterns() {
      let patterns = definitions.selectAll("pattern").data(
        nodes.filter(function (d: any) {
          return d.data.accountable;
        }),
        function (d: any) {
          return d.data.id;
        }
      );

      let enterPatterns = patterns
        .enter()
        .filter(function (d: any) {
          return d.data.accountable;
        })
        .append("pattern");

      enterPatterns
        .attr("id", function (d: any) {
          return "image" + d.data.id;
        })
        .attr("width", "100%")
        .attr("height", "100%")
        .filter(function (d: any) {
          return d.data.accountable;
        })
        .append("image")
        .attr("width", CIRCLE_RADIUS * 2)
        .attr("height", CIRCLE_RADIUS * 2)
        .attr("xlink:href", function (d: any) {
          return d.data.accountable.picture;
        });

      patterns
        .attr("id", function (d: any) {
          return "image" + d.data.id;
        })
        .attr("width", "100%")
        .attr("height", "100%")
        .filter(function (d: any) {
          return d.data.accountable;
        })
        .select("image")
        .attr("width", CIRCLE_RADIUS * 2)
        .attr("height", CIRCLE_RADIUS * 2)
        .attr("xlink:href", function (d: any) {
          return d.data.accountable.picture;
        });
      patterns.exit().remove();
    }
  }
}
