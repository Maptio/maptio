import { URIService } from "../../../../shared/services/uri/uri.service";
import { DataService } from "../../services/data.service";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { Browsers, UIService } from "../../services/ui.service";
import { ColorService } from "../../services/color.service";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableUser } from "../../../../shared/model/user.data";
import { SelectableTag, Tag } from "../../../../shared/model/tag.data";
import { IDataVisualizer } from "../../components/canvas/mapping.interface";
import { Observable, Subject, BehaviorSubject } from "rxjs/Rx";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import {
  Component,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  isDevMode,
  ElementRef
} from "@angular/core";
import { partition } from "lodash-es";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { Team } from "../../../../shared/model/team.data";
import * as screenfull from 'screenfull';

import { transition } from "d3-transition";
import { select, selectAll, event, mouse } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { scaleLog, ScaleLogarithmic } from "d3-scale";
import { HierarchyCircularNode, pack, hierarchy } from "d3-hierarchy";
import { min } from "d3-array";
import { color } from "d3-color";
import { AuthHttp } from "angular2-jwt";
import { map, tap } from "rxjs/operators";

const d3 = Object.assign(
  {},
  {
    transition,
    select,
    selectAll,
    mouse,
    min,
    zoom,
    zoomIdentity,
    scaleLog,
    pack,
    hierarchy,
    color,
    getEvent() { return require("d3-selection").event }
  }
)

@Component({
  selector: "zoomable",
  templateUrl: "./mapping.zoomable.component.html",
  styleUrls: ["./mapping.zoomable.component.css"],

  host: { 'class': 'padding-100 w-100 h-auto d-block position-relative' },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingZoomableComponent implements IDataVisualizer {
  private browser: Browsers;
  public datasetId: string;
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
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;
  public forceZoom$: Observable<Initiative>;
  public isLocked$: Observable<boolean>;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
  public showContextMenuOf$: Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }> = new Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }>();

  private zoomSubscription: Subscription;
  private dataSubscription: Subscription;
  private resetSubscription: Subscription;
  private lockedSubscription: Subscription;
  private tagsSubscription: Subscription;
  private selectableTagsSubscription: Subscription;

  private zooming: any;

  public analytics: Angulartics2Mixpanel;

  private svg: any;
  private g: any;
  private diameter: number;
  private definitions: any;
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

  public slug: string;

  CIRCLE_RADIUS: number = 16;
  MAX_TEXT_LENGTH = 35;
  TRANSITION_DURATION = 500;
  ZOOMING_TRANSITION_DURATION = 500;
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
    public colorService: ColorService,
    public uiService: UIService,
    public router: Router,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private uriService: URIService,
    private loaderService: LoaderService,
    private http: AuthHttp,
    private element:ElementRef
  ) {
    this.T = d3.transition(null).duration(this.TRANSITION_DURATION);
  }

  ngOnInit() {
    this.loaderService.show();
    // this.draw();
    // this.init();
    this.dataSubscription = this.dataService
      .get()
      .flatMap((data:any) => {
        this.uiService.clean(); return this.draw(data.initiative)})
      // .do((complexData: string) => {
      //   if (complexData[0].dataset.datasetId !== this.datasetId) {
      //     this.counter = 0;
      //   }
      // })
      .subscribe((complexData: string) => {
        // document.querySelector(".draw").innerHTML = complexData;
        (this.element.nativeElement as HTMLElement).innerHTML = complexData;
        // let data = <any>complexData[0].initiative;
        // this.datasetId = complexData[0].dataset.datasetId;
        // this.tagsState = complexData[2];
        // this.slug = data.getSlug();
        this.loaderService.show();
        // this.draw();
        // this.update(data, complexData[1], this.counter === 0)


        this.counter += 1;
        this.loaderService.hide();
        // this.analytics.eventTrack("Map", {
        //   action: "viewing",
        //   view: "initiatives",
        //   team: (<Team>complexData[0].team).name,
        //   teamId: (<Team>complexData[0].team).team_id
        // });
        this.isLoading = false;
        this.cd.markForCheck();
      },
        (err) => {
          if (!isDevMode) {
            console.error(err)
          }
        }

      )
      ;
    // this.selectableTags$.subscribe(tags => this.tagsState = tags)
  }

  draw(data:Initiative) {
    console.log("draw")
   
    return this.http.post("/api/v1/charts/make", data).pipe(
      map(responseData => {  return responseData.text() })
    )
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
    // if (this.fontSubscription) {
    //   this.fontSubscription.unsubscribe();
    // }
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
    const margin = { top: 20, right: 20, bottom: 20, left: 0 };
    const width: number = this.width - margin.left - margin.right,
      height: number = this.height;
    const svg: any = d3
      .select("svg#map")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "none")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .attr("version", "1.1"),


      innerSvg = svg/*.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("x", this.uiService.getCenteredMargin())
        .style("overflow", "visible")*/,
      diameter = this.height,
      g = innerSvg
        .append("g")
        .attr(
          "transform",
          `translate(${diameter / 2}, ${diameter / 2}) scale(1)`
        ),
      definitions = innerSvg.append("svg:defs");


    const wheelDelta = () => -d3.getEvent().deltaY * (d3.getEvent().deltaMode ? 120 : 1) / 500 * 2.5;

    this.zooming = d3
      .zoom()
      .wheelDelta(wheelDelta)
      .on("zoom", zoomed)
      .on("end", (): void => {
        this.adjustViewToZoomEvent(g, d3.getEvent());
        const transform = d3.getEvent().transform;
        innerSvg.attr("scale", transform.k);
        const tagFragment: string = this.tagsState
          .filter(t => t.isSelected)
          .map(t => t.shortid)
          .join(",");
        this.loaderService.hide();
        // location.hash = this.uriService.buildFragment(
        //   new Map([
        //     ["x", transform.x],
        //     ["y", transform.y],
        //     ["scale", transform.k],
        //     ["tags", tagFragment]
        //   ])
        // );
        this.translateX = transform.x;
        this.translateY = transform.y;
        this.scale = transform.k;
      });

    try {
      // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
      // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
      const initX: number = this.translateX || width / 2;
      const initY: number = this.translateY || diameter / 2;
      const initK: number = this.scale || 1;

      innerSvg.call(
        this.zooming.transform,
        d3.zoomIdentity
          .translate(initX, initY)
          .scale(initK)
      );
      innerSvg.call(this.zooming);
    } catch (error) {
      if (!isDevMode) console.error(error);
    }

    function zoomed() {
      g.attr("transform", d3.getEvent().transform);
    }

    this.resetSubscription = this.isReset$.filter(r => r).subscribe(isReset => {
      // innerSvg.attr("x", this.uiService.getCenteredMargin(true))
      innerSvg.transition().duration(this.ZOOMING_TRANSITION_DURATION).call(
        this.zooming.transform,
        d3.zoomIdentity.translate(

          document.querySelector("svg#map").clientWidth / 2,
          diameter / 2
        )
      );
    });

    this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
      try {
        // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
        if (zf) {
          this.zooming.scaleBy(innerSvg.transition().duration(this.ZOOMING_TRANSITION_DURATION), zf);
        } else {
          innerSvg.transition().duration(this.ZOOMING_TRANSITION_DURATION).call(
            this.zooming.transform,
            d3.zoomIdentity.translate(this.translateX, this.translateY)
          );
        }
      } catch (error) { }
    });


    let [clearSearchInitiative, highlightInitiative] = this.zoomInitiative$.partition(node => node === null);
    clearSearchInitiative.subscribe(() => {
      innerSvg.select("circle.node--root").dispatch("click");
    })
    highlightInitiative.subscribe(node => {
      innerSvg.select(`circle.node.initiative-map[id="${node.id}"]`).dispatch("click");
    });

    /*
    this.selectableTagsSubscription = this.selectableTags$.subscribe(tags => {
      console.log(tags)
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

      // function colorByTag(d:any):string{
      //   if (selectedTags.length === 0) return "initial";

      // }

      g.selectAll("g.node.initiative-map").style("fill", function (d: any) {
        if (selectedTags.length === 0) return "var(--maptio-black)";
        return uiService.filter(selectedTags, unselectedTags, d.data.tags.map((t: Tag) => t.shortid))
          ? "red"
          : "var(--maptio-black)"
        // return filterByTags(d)
      });
    });
    */

    const outerFontSizeRange = [14, 5];
    const innerFontSizeRange = [10, 3];
    const defaultScaleExtent = [0.5, 5];
    this.outerFontScale = d3.scaleLog().domain(defaultScaleExtent).range(outerFontSizeRange);
    this.innerFontScale = d3.scaleLog().domain(defaultScaleExtent).range(innerFontSizeRange);

    this.svg = innerSvg;
    this.g = g;
    this.browser = this.uiService.getBrowser();
    this.diameter = diameter;
    this.definitions = definitions;
  }

  adjustViewToZoomEvent(g: any, event: any, force?: boolean): void {
    if (!force) {
      if (this.scale === event.transform.k) return;
      if (this.scale <= 1 && event.transform.k <= 1) return;
      if (!this.outerFontScale || !this.innerFontScale) return;
    }

    const focus = this.getLastZoomedCircle();
    const zoomFactor: number = event.transform.k > 1 ? event.transform.k : 1;
    const scaleExtent: Array<number> = this.zooming.scaleExtent() ? this.zooming.scaleExtent() : [0.5, 5];
    this.outerFontScale.domain(scaleExtent);
    const myInnerFontScale: ScaleLogarithmic<number, number> = this.innerFontScale.domain(scaleExtent);

    const outerFontSize: number = this.outerFontScale(zoomFactor);
    const select: Function = d3.select;
    const MAX_NUMBER_LETTERS_PER_CIRCLE = this.MAX_NUMBER_LETTERS_PER_CIRCLE;
    const definitions = this.definitions;

    g.selectAll("circle.node")
      .each((d: any) => (d.zf = zoomFactor))

    g.selectAll(".node.no-children")
      .each(function (d: any): void {
        myInnerFontScale.range([d.r * Math.PI / MAX_NUMBER_LETTERS_PER_CIRCLE, 3]);
        select(this).select("foreignObject div")
          .transition()
          // .style("opacity", 0.7)
          // .style("font-weight", (d:any)=>{return focus.data.id === d.data.id ? "bold" : "initial"})
          // .style("color", (d:any)=>{return focus.data.id === d.data.id ? color(d.depth) : "initial"})
          .on("end", function (): void {
            select(this)
              .style("font-size", () => {
                if (focus && focus.parent
                  && (d.parent && focus.parent.data.id === d.parent.data.id
                    || focus.data.id === d.parent.data.id)

                ) {
                  return `${Math.max(d.r / 10, 1)}px`
                } else {
                  return `${myInnerFontScale(zoomFactor)}px`
                }

              })
              .style("line-height", 1.3)
              .transition()
          });
      });

    g.selectAll("text.name.with-children")
      .transition()
      // .style("opacity", 0)
      .on("end", function (d: any): void {
        select(this)
          .style("font-size", `${outerFontSize * 0.75}px`)
          // .style("font-weight", (d:any)=>{return focus.data.id === d.data.id ? "bold" : "initial"})
          // .style("fill", (d:any)=>{return focus.data.id === d.data.id ? "var(--maptio-accent)" : "initial"})
          .transition()
        // .style("opacity", 1);
      });

    const DEFAULT_PICTURE_ANGLE: number = this.DEFAULT_PICTURE_ANGLE;
    const CIRCLE_RADIUS: number = this.CIRCLE_RADIUS;
    const ANGLE = Math.PI - Math.PI * 36 / 180;
    const accountableZoomFactor = zoomFactor > 1.7 ? 1.7 : zoomFactor;
    const getAccountableRadius = (d: any) => d.children ? outerFontSize * 0.75 : myInnerFontScale(zoomFactor) * 1.5;

    definitions.selectAll("pattern > image")
      .transition()
      .on("end", function (d: any): void {
        select(this)
          .transition()
          .attr("width", getAccountableRadius(d) * 2)
          .attr("height", getAccountableRadius(d) * 2)
      })


    g.selectAll("circle.accountable")
      .transition()
      // .style("opacity", 0.5)
      .on("end", function (): void {
        select(this)
          // .style("opacity", 0.5)
          .attr("r", (d: any): number => {
            return getAccountableRadius(d)  // CIRCLE_RADIUS / accountableZoomFactor;
          })
          .attr("cx", (d: any): number => {
            return d.children
              ? Math.cos(ANGLE) * ((d.r + 1) * accountableZoomFactor) - 6
              : 0;
          })
          .attr("cy", function (d: any): number {
            return d.children
              ? -Math.sin(ANGLE) * ((d.r + 1) * accountableZoomFactor) + 6
              : -d.r * accountableZoomFactor * 0.75;
          })
          .attr("transform", `scale(${1 / accountableZoomFactor})`)
          .transition()
        // .style("opacity", 1);
      });
  }

  private _lastZoomedCircle: any;

  getLastZoomedCircle() {
    return this._lastZoomedCircle;
  }

  setLastZoomedCircle(circle: any) {
    this._lastZoomedCircle = circle;
    // localStorage.setItem("node_id", circle.data.id);
  }

  update(data: Initiative, seedColor: string, isFirstLoad: boolean): Promise<HierarchyCircularNode<{}>[]> {
    if (d3.selectAll("g").empty()) {
      this.init();
    }

    let diameter = this.diameter;
    let g = this.g;
    let svg = this.svg;
    let currentTransform = {
      transform: {
        x: this.translateX,
        y: this.translateY,
        k: this.scale
      }
    }

    let height = diameter; //svg.attr("height") * 0.99;
    let margin = 0; //height * 0.135;
    let definitions = this.definitions;
    let uiService = this.uiService;
    let zooming = this.zooming;
    let tags = this.tagsState
    let CIRCLE_RADIUS = this.CIRCLE_RADIUS;
    let TRANSITION_DURATION = this.TRANSITION_DURATION;
    let showToolipOf$ = this.showToolipOf$;
    let showContextMenuOf$ = this.showContextMenuOf$;
    // let getCenteredMargin = this.getCenteredMargin.bind(this);
    let browser = this.browser;
    let getLastZoomedCircle = this.getLastZoomedCircle.bind(this);
    let setLastZoomedCircle = this.setLastZoomedCircle.bind(this);
    let POSITION_INITIATIVE_NAME = this.POSITION_INITIATIVE_NAME;
    let DEFAULT_PICTURE_ANGLE = this.DEFAULT_PICTURE_ANGLE;
    let PADDING_CIRCLE = 20
    let MAX_NUMBER_LETTERS_PER_CIRCLE = this.MAX_NUMBER_LETTERS_PER_CIRCLE;

    let TRANSITION_1x = d3.transition("").duration(TRANSITION_DURATION)
    let TRANSITION_2x = d3.transition("").duration(TRANSITION_DURATION * 1)

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

    const color = this.colorService.getColorRange(depth, seedColor);
    const [selectedTags, unselectedTags] = partition(tags, t => t.isSelected);

    const focus = root,
      nodes: Array<any> = pack(root).descendants();
    let view: any;

    const minRadius: number = d3.min(nodes.map(node => node.r));
    this.zooming.scaleExtent([0.5, getViewScaleForRadius(minRadius)]);

    function getViewScaleForRadius(radius: number): number {
      return (height) / (radius * 2 + 20);
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
    enterWithAnimations(initiativeNoChildrenEnter, "no-children", () => {
      this.adjustViewToZoomEvent(g, currentTransform, true);
    });


    initiativeWithChildrenEnter.append("text").attr("class", "name with-children").classed("initiative-map", true);
    initiativeNoChildrenEnter.append("foreignObject").attr("class", "name no-children").classed("initiative-map", true);


    initiativeWithChildrenEnter.append("circle").attr("class", "accountable with-children").classed("initiative-map", true);
    initiativeNoChildrenEnter.append("circle").attr("class", "accountable no-children").classed("initiative-map", true);


    initiativeWithChildren = initiativeWithChildrenEnter.merge(initiativeWithChildren);
    initiativeNoChildren = initiativeNoChildrenEnter.merge(initiativeNoChildren);

    g.selectAll("g.node").sort((a: any, b: any) => {
      return b.height - a.height;
    });

    addCircle(initiativeWithChildren)
    addCircle(initiativeNoChildren)

    let circle = g.selectAll("circle.node");

    let textAround = initiativeWithChildren.select("text.name.with-children")
      .attr("id", function (d: any) {
        return `${d.data.id}`;
      })
      .style("display", function (d: any) {
        return d !== root ? "inline" : "none";
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


    initiativeNoChildren.select("foreignObject.name.no-children")
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
      .style("pointer-events", "none")
      .html((d: any): string => {
        let fs = `${toREM(d.r * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE)}rem`;
        return `<div style="font-size: ${fs}; padding-top: 5%; background: none; display: block; pointer-events: none; overflow: hidden; height:100%; line-height: 100%; text-overflow:ellipsis;">${d.data.name || '(Empty)'}</div>`;
      })

    let accountablePictureWithChildren = initiativeWithChildren.select("circle.accountable.with-children")
      .attr("fill", function (d: any) {
        return d.data.accountable ? "url('#image" + d.data.id + "')" : "transparent";
      })
      .style("display", function (d: any) {
        return d !== root ? "inline" : "none";
      });

    let accountablePictureWithoutChildren = initiativeNoChildren.select("circle.accountable.no-children")
      .attr("fill", function (d: any) {
        return d.data.accountable ? "url('#image" + d.data.id + "')" : "transparent";
      })

    let node = g.selectAll("g.node");

    svg
      .on("click", (): void => {
        zoom(root);
        showToolipOf$.next({ initiatives: null, isNameOnly: false });
        d3.getEvent().stopPropagation();
      })

    initMapElementsAtPosition([root.x, root.y]);

    try {
      // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)

      console.log(this.translateX, this.translateY)
      svg.call(
        this.zooming.transform,
        d3.zoomIdentity
          .translate(this.translateX, this.translateY)
          .scale(this.scale)
      );
      svg.call(this.zooming);
    } catch (error) { console.error(error); }

    if (localStorage.getItem("node_id")) {
      let id = localStorage.getItem("node_id");
      if (getLastZoomedCircle().data.id.toString() === id.toString()) return;
      this.svg.select(`circle.node.initiative-map[id="${id}"]`).dispatch("click");
    }

    return Promise.resolve(nodes);

    function getClickedElementCoordinates(clickedElement: any, newScale: number, translateX: number, translateY: number): Array<number> {
      let clickedX = 0;
      let clickedY = 0;
      if (
        clickedElement
        && clickedElement.transform
        && (clickedElement.transform.baseVal.length > 0 || clickedElement.transform.baseVal.numberOfItems > 0)
      ) {
        clickedX = clickedElement.transform.baseVal.getItem(0).matrix.e * newScale;
        clickedY = clickedElement.transform.baseVal.getItem(0).matrix.f * newScale;
        clickedX -= margin;
        clickedY -= margin;
      }
      else {
        // in case we are zooming prgramatically and the svg doesnt have the reference to transform

        clickedX = translateX * newScale;
        clickedY = translateY * newScale;
        clickedX -= margin;
        clickedY -= margin;
      }
      return [clickedX, clickedY];
    }

    function zoom(focus: any, clickedElement?: any): void {
      setLastZoomedCircle(focus);

      const newScale: number = focus === root || focus.parent === root ? 1 : getViewScaleForRadius(focus.r);
      const coordinates: Array<number> = getClickedElementCoordinates(clickedElement, newScale, focus.translateX, focus.translateY);


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
      view = v;
      node
        .transition()
        .duration((d: any): number => d.children ? TRANSITION_DURATION / 5 : TRANSITION_DURATION / 5)
        .attr("transform", (d: any): string => `translate(${d.x - v[0]}, ${d.y - v[1]})`)
        .style("opacity", function (d: any) {
          if (selectedTags.length === 0) return 1;
          return uiService.filter(selectedTags, unselectedTags, d.data.tags.map((t: Tag) => t.shortid))
            ? 1
            : 0.1
        })
        .each((d: any) => (d.translateX = d.x - v[0]))
        .each((d: any) => (d.translateY = d.y - v[1]))

      textAround
        .call(passingThrough, "mouseover")
        .call(passingThrough, "mouseout")
        .call(passingThrough, "contextmenu");

      g.selectAll("circle.accountable")
        .call(passingThrough, "click")
        .call(passingThrough, "mouseover")
        .call(passingThrough, "mouseout")
        .call(passingThrough, "contextmenu")

      // definitions.selectAll("pattern > image")
      //   .attr("width", function(d:any){return d.r * 2} )
      //   .attr("height", function(d:any){return d.r * 2} )
      // .attr("height", CIRCLE_RADIUS * 2)


      circle
        .attr("r", function (d: any) {
          return d.r;
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
        .style("stroke-opacity", 0)
        .on("mouseover", function (d: any) {
          let initiative = d.data;
          d3.getEvent().stopPropagation();
          d3.getEvent().preventDefault();
          // showToolipOf$.next({ initiatives: [initiative], isNameOnly: false });

          d3.select(this)
            .style("stroke", d3.color(seedColor).darker(1).toString())
            .style("stroke-opacity", 1)
            .style("stroke-width", `${Math.max(4 / d.zf, 1)}px`);

        })
        .on("mouseout", function (d: any) {
          // showToolipOf$.next({ initiatives: null, isNameOnly: false });
          showContextMenuOf$.next({ initiatives: null, x: 0, y: 0, isReadOnlyContextMenu: false })
          d3.select(this)
            .style("stroke", function (d: any) {
              return d.children
                ? color(d.depth)
                : !d.children && d.parent === root ? color(d.depth) : null;
            })
            .style("stroke-width", "initial")
            .style("stroke-opacity", 0)
        })
        .on("contextmenu", function (d: any) {
          d3.getEvent().preventDefault();
          let mousePosition;

          if (Number.isNaN(d3.mouse(this)[0]) || Number.isNaN(d3.mouse[1])) {
            mousePosition = d3.getEvent().detail.position
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

    }





    function addCircle(groups: any): void {
      console.log("addCircle")
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
          showToolipOf$.next({ initiatives: [d.data], isNameOnly: false });

          if (getLastZoomedCircle().data.id === d.data.id) {
            setLastZoomedCircle(root);
            zoom(root);
            localStorage.setItem("node_id", null)

          } else {
            setLastZoomedCircle(d);
            localStorage.setItem("node_id", d.data.id)
            zoom(d, this.parentElement);
          }

          d3.getEvent().stopPropagation();
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

    function enterWithAnimations(groups: any, className: string, callback?: Function): void {
      groups
        .attr("class", (d: any): string => {
          return d.parent
            ? d.children ? "node" : "node node--leaf"
            : "node node--root";
        })
        .classed(className, true)
        .classed("initiative-map", true)
        .attr("id", (d: any): string => `${d.data.id}`);

      groups.append("circle")
        .style("fill", (d: any): string => {
          return d.children
            ? color(d.depth)
            : !d.children && d.parent === root ? color(d.depth) : null;
        })
        .transition(TRANSITION_2x)
        .style("fill", COLOR_ADD_CIRCLE)
        .attr("r", (d: any): number => d.r)
        .transition(TRANSITION_1x)
        .style("fill", (d: any): string => {
          return d.children
            ? color(d.depth)
            : !d.children && d.parent === root ? color(d.depth) : null;
        })
        .on("end", (d: any, i: number, e: Array<HTMLElement>): void => {
          const elements = e.filter(el => el);
          if (callback && i >= elements.length - 1) callback();
        });
      if (groups.empty() && callback) callback();
    }

    function buildPaths() {
      let path = svg.select("defs")
        .selectAll("path")
        .data(nodes, function (d: any) {
          return d.data.id;
        });

      path.exit().remove();
      path = path.enter()
        .append("path")
        .merge(path)
        .attr("id", function (d: any) {
          return `path${d.data.id}`;
        })
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

    function passingThrough(el: any, eventName: string) {
      if (eventName == "contextmenu") {
        el.on("contextmenu", function (d: any): void {
          d3.getEvent().preventDefault();
          let mouse = d3.mouse(this);
          d3.select(`circle.node[id="${d.data.id}"]`).dispatch("contextmenu", { bubbles: true, cancelable: true, detail: { position: [mouse[0], mouse[1]] } });
        })
      } else {
        el
          .on(eventName, function (d: any): void {
            d3.select(`circle.node[id="${d.data.id}"]`).dispatch(eventName);
          })
      }
    }
  }
}
