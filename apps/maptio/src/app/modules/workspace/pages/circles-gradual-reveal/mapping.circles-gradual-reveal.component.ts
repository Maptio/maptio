import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  isDevMode,
} from "@angular/core";
import { Router } from "@angular/router";

import { tap, combineLatest } from 'rxjs/operators';
import { Observable, Subject, partition } from "rxjs";

import { SubSink } from 'subsink';

import { hierarchy, pack } from 'd3-hierarchy';

import { URIService } from "../../../../shared/services/uri/uri.service";
import { DataService } from "../../services/data.service";
import { UIService } from "../../services/ui.service";
import { ColorService } from "../../services/color.service";
import { PermissionsService } from "../../../../shared/services/permissions/permissions.service";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableTag } from "../../../../shared/model/tag.data";
import { IDataVisualizer } from "../../components/canvas/mapping.interface";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { Team } from "../../../../shared/model/team.data";

import { InitiativeViewModel, InitiativeNode } from './shared/initiative.model';
import { CircleMapService } from './shared/circle-map.service';


@Component({
  selector: "maptio-circles-gradual-reveal",
  templateUrl: "./mapping.circles-gradual-reveal.component.html",
  styleUrls: ["./mapping.circles-gradual-reveal.component.css"],
  host: { 'class': 'padding-100 w-100 h-auto d-block position-relative' },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingCirclesGradualRevealComponent implements IDataVisualizer, OnInit, OnDestroy {
  // OLD CODE:
  // private browser: Browsers;
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
  // public selectableUsers$: Observable<Array<SelectableUser>>;
  public isReset$: Observable<boolean>;
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;
  // public forceZoom$: Observable<Initiative>;
  // public isLocked$: Observable<boolean>;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
  public showContextMenuOf$: Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }> = new Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }>();

  // // private zoomSubscription: Subscription;
  // private dataSubscription: Subscription;
  // private resetSubscription: Subscription;
  // private lockedSubscription: Subscription;
  // private tagsSubscription: Subscription;
  // private selectableTagsSubscription: Subscription;

  // private zooming: any;

  public analytics: Angulartics2Mixpanel;

  // private svg: any;
  // private g: any;
  // private diameter: number;
  // private definitions: any;
  // private outerFontScale: ScaleLogarithmic<number, number>;
  // private innerFontScale: ScaleLogarithmic<number, number>;
  // public isWaitingForDestinationNode = false;
  // public isTooltipDescriptionVisible = false;
  // public isFirstEditing = false;
  // public isLocked: boolean;
  public isLoading: boolean;

  // public selectedNode: Initiative;
  // public selectedNodeParent: Initiative;
  // public hoveredNode: Initiative;

  public slug: string;

  // CIRCLE_RADIUS = 16;
  // MAX_TEXT_LENGTH = 35;
  // TRANSITION_DURATION = 500;
  // ZOOMING_TRANSITION_DURATION = 500;
  // TRANSITION_OPACITY = 750;
  // RATIO_FOR_VISIBILITY = 0.08;
  // FADED_OPACITY = 0.1;
  // MAX_NUMBER_LETTERS_PER_CIRCLE = 15;
  // MIN_TEXTBOX_WIDTH = 100;
  // T: any;

  // POSITION_INITIATIVE_NAME = { x: 0.9, y: 0.1, fontRatio: 1 };
  // POSITION_TAGS_NAME = { x: 0, y: 0.3, fontRatio: 0.65 };
  // POSITION_ACCOUNTABLE_NAME = { x: 0, y: 0.45, fontRatio: 0.9 };
  // DEFAULT_PICTURE_ANGLE = Math.PI - Math.PI * 36 / 180;

  counter = 0;



  // FROM NEW MAP UX:
  private subs = new SubSink();

  private dataset: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  circles: InitiativeNode[] = [];
  rootCircle: InitiativeNode | undefined = undefined;
  primaryCircles: InitiativeNode[] = [];

  seedColor: string;

  isFirstLoad = true;


  constructor(
    public colorService: ColorService,
    public uiService: UIService,
    public router: Router,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private uriService: URIService,
    private loaderService: LoaderService,
    private permissionsService: PermissionsService,
    private circleMapService: CircleMapService,
  ) {
    // this.T = d3.transition(null).duration(this.TRANSITION_DURATION);
  }

  ngOnInit() {
    this.loaderService.show();

    this.init();

    this.subs.sink = this.dataService
      .get()
      .pipe(
        combineLatest(this.mapColor$, this.selectableTags$),
        tap((complexData: [any, string, SelectableTag[]]) => {
          if (complexData[0].dataset.datasetId !== this.datasetId) {
            this.counter = 0;
          }
        }),
      )
      .subscribe(
        (complexData: [any, string, SelectableTag[]]) => {
          let data = <any>complexData[0].initiative;
          this.datasetId = complexData[0].dataset.datasetId;
          this.tagsState = complexData[2];
          this.slug = data.getSlug();
          this.loaderService.show();

          this.dataset = data;
          this.seedColor = complexData[1];

          this.prepareLayout();
          this.clearCircleStates();
          this.identifyCircleTypes();
          this.assignColorsToCircles();

          const lastSelectedCircle = this.circleMapService.getLastSelectedCircle(this.circles);

          if(this.isFirstLoad) {
            this.circleMapService.resetZoom();
            this.subs.sink = this.circleMapService.selectedCircle.subscribe(() => {
              this.adjustPrimaryCircleSelectionBasedOnSelectedCircle();
              this.toggleInfoPanelBasedOnSelectedCircle();
            });

            const [clearSearchInitiative, highlightInitiative] = partition(
              this.zoomInitiative$,
              node => node === null
            );

            clearSearchInitiative.subscribe(() => {
              this.clearCircleStates();
              this.circleMapService.deselectSelectedCircle();
              this.toggleInfoPanelBasedOnSelectedCircle();
              this.circleMapService.resetZoom();
              this.cd.markForCheck();
            });

            highlightInitiative.subscribe(node => {
              const highlightedCircle = this.circles.find((circle) => circle.data.id === node.id);
              if (highlightedCircle) {
                this.clearCircleStates();
                this.circleMapService.selectCircle(highlightedCircle);
                this.circleMapService.resetZoom();
                this.circleMapService.zoomToCircle(highlightedCircle);
                this.cd.markForCheck();
              }
            });
          } else {
            // Trigger this method not just when a circle is selected but also any time data is updated
            this.adjustPrimaryCircleSelectionBasedOnSelectedCircle();
          }

          if(lastSelectedCircle) {
            this.circleMapService.selectCircle(lastSelectedCircle);
            this.circleMapService.zoomToCircle(lastSelectedCircle);
          }

          this.isFirstLoad = false;
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
        (err) => {
          if (!isDevMode) {
            console.error(err)
          }
        }
      );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  prepareLayout() {
    const diameter = 1000;
    const margin = 15;
    const PADDING_CIRCLE = 20;

    const packInitiatives = pack<InitiativeViewModel>()
      .size([diameter - margin, diameter - margin])
      .padding(function () { // eslint-disable-line @typescript-eslint/no-explicit-any
        return PADDING_CIRCLE;
      });

    const root: any = hierarchy(this.dataset) // eslint-disable-line @typescript-eslint/no-explicit-any
      .sum(function (d) {
        return (Object.prototype.hasOwnProperty.call(d, 'accountable')? 1 : 0) +
          (Object.prototype.hasOwnProperty.call(d, 'helpers') ? d.helpers.length : 0) + 1;
      })
      .sort(function (a, b) {
        if (a && a.value && b && b.value) {
          return b.value - a.value;
        } else {
          return 0;
        }
      });

    this.circles = packInitiatives(root).descendants();
  }

  clearCircleStates() {
    this.circles.forEach((circle) => {
      circle.data.isSelected = false;
      circle.data.isOpened = false;
    });
  }

  identifyCircleTypes() {
    if (this.circles) {
      this.rootCircle = this.circles[0];
      this.primaryCircles = this.rootCircle.children ? this.rootCircle.children : [];
    }

    this.circles.forEach((circle) => {
      circle.data.isLeaf = circle.children ? false : true;
      circle.data.isPrimary = false;
      circle.data.isChildOfPrimary = false;
    });

    this.primaryCircles.forEach((primaryCircle) => {
      primaryCircle.data.isPrimary = true;

      primaryCircle.children?.forEach((childOfPrimaryCircle) => {
        childOfPrimaryCircle.data.isChildOfPrimary = true;
      })
    });
  }

  calculateMaxDepth() {
    let maxDepth = 0;
    this.rootCircle?.eachAfter((node): void => {
        maxDepth = maxDepth > node.depth ? maxDepth : node.depth;
    });
    return maxDepth;
  }

  assignColorsToCircles() {
    const maxDepth = this.calculateMaxDepth();
    const colorRange = this.colorService.getColorRangeNew(maxDepth, this.seedColor);

    this.circles.forEach((circle) => {
      const isPrimaryCircle = this.primaryCircles.includes(circle);
      const isChildOfPrimaryCircle = circle.parent ? this.primaryCircles.includes(circle.parent) : false;

      if (circle.data.isLeaf && !isPrimaryCircle && !isChildOfPrimaryCircle) {
        circle.data.color = '#ffffff';
      } else {
        circle.data.color = colorRange(circle.depth - 1);
      }
    });
  }

  adjustPrimaryCircleSelectionBasedOnSelectedCircle() {
    const selectedCircle = this.circleMapService.selectedCircle.value;

    if (selectedCircle) {
      this.markPrimaryCirclesAsNotSelected();

      if (this.primaryCircles.includes(selectedCircle)) {
        this.circleMapService.markCircleAsSelected(selectedCircle);
      }
    } else {
      this.markPrimaryCirclesAsSelected();
    }
  }

  toggleInfoPanelBasedOnSelectedCircle() {
    const selectedCircle = this.circleMapService.selectedCircle.value;

    if (selectedCircle) {
      this.showInfoPanelFor(selectedCircle);
    } else {
      this.hideInfoPanel();
    }
  }

  markPrimaryCirclesAsSelected() {
    this.primaryCircles.forEach(primaryCircle => {
      this.circleMapService.markCircleAsSelected(primaryCircle);
    });
  }

  markPrimaryCirclesAsNotSelected() {
    this.primaryCircles.forEach(primaryCircle => {
      this.circleMapService.markCircleAsNotSelected(primaryCircle);
    });
  }

  showInfoPanelFor(circle: InitiativeNode) {
    this.showToolipOf$.next({ initiatives: [circle.data as unknown as Initiative], isNameOnly: false });
  }

  hideInfoPanel() {
    this.showToolipOf$.next({ initiatives: null, isNameOnly: false });
  }

  onBackdropClick() {
    this.circleMapService.onBackdropClick();
  }

  // TODO: Set last opened when you open a circle and get that when you open the map
  //       and when switching between the new map and the expanded map
//       groups.select("circle")
//         .on("click", function (d: any, index: number, elements: Array<HTMLElement>): void {
//           showToolipOf$.next({ initiatives: [d.data], isNameOnly: false });

//           if (getLastZoomedCircle().data.id === d.data.id) {
//             setLastZoomedCircle(root);
//             zoom(root);
//             localStorage.setItem("node_id", null)

//           } else {
//             setLastZoomedCircle(d);
//             localStorage.setItem("node_id", d.data.id)
//             zoom(d, this.parentElement);
//           }

//           d3.getEvent().stopPropagation();
//         })


  // Old code

  init() {
    // TODO: Reimplement zoom reset
//     this.resetSubscription = this.isReset$.pipe(filter(r => r)).subscribe(isReset => {
//       // innerSvg.attr("x", this.uiService.getCenteredMargin(true))
//       innerSvg.transition().duration(this.ZOOMING_TRANSITION_DURATION).call(
//         this.zooming.transform,
//         d3.zoomIdentity.translate(

// document.querySelector("svg#map").clientWidth / 2,
//           diameter / 2
//         )
//       );
//     });

    // TODO: Reimplement zoom buttons
    // this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
    //   try {
    //     // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
    //     if (zf) {
    //       this.zooming.scaleBy(innerSvg.transition().duration(this.ZOOMING_TRANSITION_DURATION), zf);
    //     } else {
    //       innerSvg.transition().duration(this.ZOOMING_TRANSITION_DURATION).call(
    //         this.zooming.transform,
    //         d3.zoomIdentity.translate(this.translateX, this.translateY)
    //       );
    //     }
    //   } catch (error) { }
    // });

    // TODO: Reimplement search initiative highlighting
//     let [clearSearchInitiative, highlightInitiative] = partition(
//       this.zoomInitiative$,
//       node => node === null
//     );

//     clearSearchInitiative.subscribe(() => {
//       innerSvg.select("circle.node--root").dispatch("click");
//     })
//     highlightInitiative.subscribe(node => {
//       innerSvg.select(`circle.node.initiative-map[id="${node.id}"]`).dispatch("click");
//     });
  }

  // adjustViewToZoomEvent(g: any, event: any, force?: boolean): void {
    // if (!force) {
    //   if (this.scale === event.transform.k) return;
    //   if (this.scale <= 1 && event.transform.k <= 1) return;
    //   if (!this.outerFontScale || !this.innerFontScale) return;
    // }

    // const focus = this.getLastZoomedCircle();
    // const zoomFactor: number = event.transform.k > 1 ? event.transform.k : 1;
    // const scaleExtent: Array<number> = this.zooming.scaleExtent() ? this.zooming.scaleExtent() : [0.5, 5];
    // this.outerFontScale.domain(scaleExtent);
    // const myInnerFontScale: ScaleLogarithmic<number, number> = this.innerFontScale.domain(scaleExtent);

    // const outerFontSize: number = this.outerFontScale(zoomFactor);
    // const select: Function = d3.select;
    // const MAX_NUMBER_LETTERS_PER_CIRCLE = this.MAX_NUMBER_LETTERS_PER_CIRCLE;
    // const definitions = this.definitions;

    // g.selectAll("circle.node")
    //   .each((d: any) => (d.zf = zoomFactor))

    // g.selectAll(".node.no-children")
    //   .each(function (d: any): void {
    //     myInnerFontScale.range([d.r * Math.PI / MAX_NUMBER_LETTERS_PER_CIRCLE, 3]);
    //     select(this).select("foreignObject div")
    //       .transition()
    //       // .style("opacity", 0.7)
    //       // .style("font-weight", (d:any)=>{return focus.data.id === d.data.id ? "bold" : "initial"})
    //       // .style("color", (d:any)=>{return focus.data.id === d.data.id ? color(d.depth) : "initial"})
    //       .on("end", function (): void {
    //         select(this)
    //           .style("font-size", () => {
    //             if (focus && focus.parent
    //               && (d.parent && focus.parent.data.id === d.parent.data.id
    //                 || focus.data.id === d.parent.data.id)

    //             ) {
    //               return `${Math.max(d.r / 10, 1)}px`
    //             } else {
    //               return `${myInnerFontScale(zoomFactor)}px`
    //             }

    //           })
    //           .style("line-height", 1.3)
    //           .transition()
    //       });
    //   });

    // g.selectAll("text.name.with-children")
    //   .transition()
    //   // .style("opacity", 0)
    //   .on("end", function (d: any): void {
    //     select(this)
    //       .style("font-size", `${outerFontSize * 0.75}px`)
    //       // .style("font-weight", (d:any)=>{return focus.data.id === d.data.id ? "bold" : "initial"})
    //       // .style("fill", (d:any)=>{return focus.data.id === d.data.id ? "var(--maptio-accent)" : "initial"})
    //       .transition()
    //     // .style("opacity", 1);
    //   });

    // const DEFAULT_PICTURE_ANGLE: number = this.DEFAULT_PICTURE_ANGLE;
    // const CIRCLE_RADIUS: number = this.CIRCLE_RADIUS;
    // const ANGLE = Math.PI - Math.PI * 36 / 180;
    // const accountableZoomFactor = zoomFactor > 1.7 ? 1.7 : zoomFactor;
    // const getAccountableRadius = (d: any) => d.children ? outerFontSize * 0.75 : myInnerFontScale(zoomFactor) * 1.5;

    // definitions.selectAll("pattern > image")
    //   .transition()
    //   .on("end", function (d: any): void {
    //     select(this)
    //       .transition()
    //       .attr("width", getAccountableRadius(d) * 2)
    //       .attr("height", getAccountableRadius(d) * 2)
    //   })


    // g.selectAll("circle.accountable")
    //   .transition()
    //   // .style("opacity", 0.5)
    //   .on("end", function (): void {
    //     select(this)
    //       // .style("opacity", 0.5)
    //       .attr("r", (d: any): number => {
    //         return getAccountableRadius(d)  // CIRCLE_RADIUS / accountableZoomFactor;
    //       })
    //       .attr("cx", (d: any): number => {
    //         return d.children
    //           ? Math.cos(ANGLE) * ((d.r + 1) * accountableZoomFactor) - 6
    //           : 0;
    //       })
    //       .attr("cy", function (d: any): number {
    //         return d.children
    //           ? -Math.sin(ANGLE) * ((d.r + 1) * accountableZoomFactor) + 6
    //           : -d.r * accountableZoomFactor * 0.75;
    //       })
    //       .attr("transform", `scale(${1 / accountableZoomFactor})`)
    //       .transition()
    //       // .style("opacity", 1);
    //   });
  // }

//   private _lastZoomedCircle: any;

  // getLastZoomedCircle() {
    // return this._lastZoomedCircle;
  // }

  // setLastZoomedCircle(circle: any) {
//     this._lastZoomedCircle = circle;
//     // localStorage.setItem("node_id", circle.data.id);
  // }

  // TODO: Zoom to last circle on load
//     if (isFirstLoad) {
//       setLastZoomedCircle(root);
//     }

  // TODO: On clicking backdrop also deselect initiative...
//     svg
//       .on("click", (): void => {
//         zoom(root);
//         showToolipOf$.next({ initiatives: null, isNameOnly: false });
//         d3.getEvent().stopPropagation();
//       })

  // TODO: Select last selected circle when the map opens
//     if (localStorage.getItem("node_id")) {
//       let id = localStorage.getItem("node_id");
//       if (getLastZoomedCircle() && getLastZoomedCircle().data.id && getLastZoomedCircle().data.id.toString() === id.toString()) return;
//       this.svg.select(`circle.node.initiative-map[id="${id}"]`).dispatch("click");
//     }
}
