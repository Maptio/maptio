import { UserFactory } from "./../../../shared/services/user.factory";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { D3Service, D3 } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/ui/color.service";
import { UIService } from "../../../shared/services/ui/ui.service";
import { IDataVisualizer } from "../mapping.interface";
import { Observable, Subject } from "rxjs/Rx";
import { Initiative } from "../../../shared/model/initiative.data";
import { Angulartics2Mixpanel } from "angulartics2";
import { DataService, URIService } from "../../../shared/services/data.service";
import { Tag, SelectableTag } from "../../../shared/model/tag.data";
import * as _ from "lodash";

@Component({
  selector: "tree",
  templateUrl: "./mapping.tree.component.html",
  styleUrls: ["./mapping.tree.component.css"],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingTreeComponent implements OnInit, IDataVisualizer {
  private d3: D3;
  public width: number;

  public datasetId: string;
  public teamId: string;
  public teamName: string;

  public height: number;

  public margin: number;
  public translateX: number;
  public translateY: number;
  public scale: number;
  public tagsState: Array<SelectableTag>;

  public zoom$: Observable<number>;
  public selectableTags$: Observable<Array<SelectableTag>>;
  public fontSize$: Observable<number>;
  public fontColor$: Observable<string>;
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;
  // public isLocked$: Observable<boolean>;
  public isReset$: Observable<boolean>;
  public data$: Subject<{
    initiative: Initiative;
    datasetId: string;
    teamName: string;
    teamId: string;
  }>;

  private zoomSubscription: Subscription;
  private dataSubscription: Subscription;
  private resetSubscription: Subscription;
  private fontSubscription: Subscription;
  private tagsSubscription: Subscription;

  public analytics: Angulartics2Mixpanel;

  private svg: any;
  private g: any;
  private definitions: any;
  public isLoading: boolean;

  public hoveredNode: Initiative;
  public slug: string;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
  public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();
  public moveInitiative$: Subject<{
    node: Initiative;
    from: Initiative;
    to: Initiative;
  }> = new Subject<{ node: Initiative; from: Initiative; to: Initiative }>();
  public closeEditingPanel$: Subject<boolean> = new Subject<boolean>();

  MAX_TEXT_LENGTH = 135;

  constructor(
    public d3Service: D3Service,
    public colorService: ColorService,
    public uiService: UIService,
    public router: Router,
    private userFactory: UserFactory,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private uriService: URIService
  ) {
    // console.log("tree constructor")
    this.d3 = d3Service.getD3();
    this.data$ = new Subject<{
      initiative: Initiative;
      datasetId: string;
      teamName: string;
      teamId: string;
    }>();
  }

  init() {
    this.uiService.clean();
    let d3 = this.d3;
    let viewerWidth = this.width;
    let viewerHeight = this.height;

    // let margins = { top: 0, right: this.margin, bottom: this.margin, left: this.margin }

    // declares a tree layout and assigns the size
    // CAREFUL : width and height are reversed in this function
    d3.tree().size([viewerWidth / 2, viewerHeight]);

    function zoomed() {
      g.attr("transform", d3.event.transform);
    }

    let zooming = d3
      .zoom()
      .scaleExtent([1 / 3, 3])
      .on("zoom", zoomed)
      .on("end", () => {
        let transform = d3.event.transform;
        let tagFragment = this.tagsState
          .filter(t => t.isSelected)
          .map(t => t.shortid)
          .join(",");
        location.hash = this.uriService.buildFragment(
          new Map([
            ["x", transform.x],
            ["y", transform.y],
            ["scale", transform.k],
            ["tags", tagFragment]
          ])
        );
      });

    let svg: any = d3
      .select("svg")
      .attr("width", viewerWidth)
      .attr("height", viewerHeight)
      .attr("class", "overlay")
      .style("background", "#fff");

    let g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`
      );
    let definitions = g.append("defs");

    this.fontSubscription = this.fontSize$
      .combineLatest(this.fontColor$)
      .subscribe((format: [number, string]) => {
        // font size
        svg.attr("font-size", format[0] + "rem");
        svg.selectAll("text").attr("font-size", format[0] + "rem");
        // font color
        svg.style("fill", format[1]);
        svg.selectAll("text").style("fill", format[1]);
      });

    try {
      // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
      svg.call(
        zooming.transform,
        d3.zoomIdentity
          .translate(this.translateX, this.translateY)
          .scale(this.scale)
      );
      svg.call(zooming);
    } catch (error) {}

    this.resetSubscription = this.isReset$.filter(r => r).subscribe(isReset => {
      svg.call(
        zooming.transform,
        d3.zoomIdentity.translate(100, this.height / 4)
      );
    });

    this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
      try {
        // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
        if (zf) {
          zooming.scaleBy(svg, zf);
        } else {
          svg.call(
            zooming.transform,
            d3.zoomIdentity.translate(this.translateX, this.translateY)
          );
        }
      } catch (error) {}
    });

    this.svg = svg;
    this.g = g;
    this.definitions = definitions;
  }

  ngOnInit() {
    this.isLoading = true;
    this.init();
    this.dataSubscription = this.dataService
      .get()
      .combineLatest(this.selectableTags$, this.mapColor$)
      .subscribe((complexData: [any, SelectableTag[], string]) => {
        let data = <any>complexData[0].initiative;
        this.datasetId = complexData[0].datasetId;
        this.slug = data.getSlug();
        this.tagsState = complexData[1];
        this.update(data, complexData[1], complexData[2]);
        this.analytics.eventTrack("Map", {
          view: "people",
          team: data.teamName,
          teamId: data.teamId
        });
        this.isLoading = false;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this.zoomSubscription) {
      this.zoomSubscription.unsubscribe();
    }
    if (this.fontSubscription) {
      this.fontSubscription.unsubscribe();
    }
    if (this.resetSubscription) {
      this.resetSubscription.unsubscribe();
    }
    if (this.tagsSubscription) {
      this.tagsSubscription.unsubscribe();
    }
  }

  hoverInitiative(node: Initiative) {
    this.hoveredNode = node;
    this.cd.markForCheck();
  }

  // draw(translateX: number, translateY: number, scale: number) {
  update(data: any, tags: Array<SelectableTag>, seedColor: string) {
    if (this.d3.selectAll("g").empty()) {
      this.init();
    }

    let d3 = this.d3;
    let colorService = this.colorService;
    let uiService = this.uiService;
    let CIRCLE_RADIUS = 15;
    let MAX_TEXT_LENGTH = this.MAX_TEXT_LENGTH;
    let viewerWidth = this.width;
    let viewerHeight = this.height;
    // let zoom$ = this.zoom$;
    // let fontSize$ = this.fontSize$;
    let datasetId = this.datasetId;
    let router = this.router;
    let userFactory = this.userFactory;
    let showDetailsOf$ = this.showDetailsOf$;
    // let svg = this.svg;
    let g = this.g;
    let definitions = this.definitions;
    let hoverInitiative = this.hoverInitiative.bind(this);
    // let slug = this.slug;
    let datasetSlug = this.slug;

    let treemap = d3
      .tree()
      .size([viewerWidth / 2, viewerHeight])
      .nodeSize([65, 1]);

    let i = 0,
      // duration = 750,
      root: any;

    // Assigns parent, children, height, depth
    root = d3.hierarchy(data, function(d) {
      return d.children;
    });
    root.x0 = viewerHeight;
    root.y0 = 0;

    let depth = 0;
    root.eachAfter(function(n: any) {
      depth = depth > n.depth ? depth : n.depth;
    });
    let color = colorService.getColorRange(depth, seedColor);

    // Collapse after the third level
    root.children.forEach((c: any) => {
      if (c.children) c.children.forEach(collapse);
    });
    // console.log(g)
    update(root, 0);

    // Collapse the node and all it's children
    function collapse(d: any) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    function update(source: any, duration: number) {
      // Assigns the x and y position for the nodes
      let treeData = treemap(root);

      // Compute the new tree layout.
      let nodes = treeData.descendants(),
        links = treeData.descendants().slice(1),
        list = d3.hierarchy(data).descendants();

      // Normalize for fixed-depth.
      nodes.forEach(function(d: any) {
        d.y = d.depth * 200;
        d.x = d.x * 1.4;
      });

      let tooltip = d3
        .select("body")
        .selectAll("div.arrow_box")
        .data(nodes, function(d: any) {
          return d.data.id;
        })
        .enter()
        .append("div")
        .attr("class", "arrow_box")
        .classed("show", false)
        .attr("id", function(d: any) {
          return `${d.data.id}`;
        })
        .on("mouseenter", function() {
          d3.select(this).classed("show", true);
        })
        .on("mouseleave", function() {
          tooltip.classed("show", false);
        })
        .html(function(d: any) {
          return uiService.getTooltipHTML(d.data);
        });

      d3.selectAll(`.open-initiative`).on("click", function(d: any) {
        let id = Number.parseFloat(d3.select(this).attr("id"));
        showDetailsOf$.next(list.find(n => (<any>n.data).id === id).data);
      });
      d3.selectAll(`.open-summary`).on("click", function(d: any) {
        let shortid = d3.select(this).attr("data-shortid");
        let slug = d3.select(this).attr("data-slug");
        router.navigateByUrl(
          `/map/${datasetId}/${datasetSlug}/u/${shortid}/${slug}`
        );
      });

      // ****************** Nodes section ***************************

      // Update the nodes...
      // console.log(g)
      let node = g.selectAll("g.node.tree-map").data(nodes, function(d: any) {
        return d.id || (d.id = ++i);
      });
      let [selectedTags, unselectedTags] = _.partition(tags, t => t.isSelected);

      g.selectAll("g.node.tree-map").style("opacity", function(d: any) {
        return uiService.filter(
          selectedTags,
          unselectedTags,
          d.data.tags.map((t: Tag) => t.shortid)
        )
          ? // &&
            // uiService.filter(selectedUsers, unselectedUsers, _.compact(_.flatten([...[d.data.accountable], d.data.helpers])).map(u => u.shortid))
            1
          : 0.1;
      });

      // let definitions = g.append("defs")
      // definitions.selectAll("pattern")
      //     .data(nodes)
      //     .enter()
      //     .append("pattern")
      //     .attr("id", function (d: any) { return "image" + d.data.id; })
      //     .attr("width", "100%")
      //     .attr("height", "100%")
      //     .append("image")
      //     .attr("width", CIRCLE_RADIUS * 2)
      //     .attr("height", CIRCLE_RADIUS * 2)
      //     .attr("xlink:href", function (d: any) { return d.data.accountable ? d.data.accountable.picture : ""; })
      //     ;

      let patterns = definitions
        .selectAll("pattern")
        .data(nodes, function(d: any) {
          return d.data.id;
        });
      let enterPatterns = patterns.enter().append("pattern");

      enterPatterns
        .merge(patterns)
        .filter(function(d: any) {
          return d.data.accountable;
        })
        .attr("id", function(d: any) {
          return "image" + d.data.id;
        })
        .attr("width", "100%")
        .attr("height", "100%")
        .append("image")
        .attr("width", CIRCLE_RADIUS * 2)
        .attr("height", CIRCLE_RADIUS * 2)
        .attr("xlink:href", function(d: any) {
          return d.data.accountable ? d.data.accountable.picture : "";
        });
      patterns.exit().remove();

      // Enter any new modes at the parent's previous position.
      let nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .classed("tree-map", true)
        .attr("tags-id", function(d: any) {
          return d.data.tags.map((t: Tag) => t.shortid).join(",");
        })
        .attr("transform", function(d: any) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click);

      // Add Circle for the nodes
      nodeEnter
        .append("circle")
        .attr("class", "node")
        .classed("tree-map", true)
        .attr("r", 1e-4)
        .attr("fill", function(d: any) {
          return d.data.accountable
            ? "url(#image" + d.data.id + ")"
            : d.children ? color(d.depth) : "#fff";
        })
        .style("stroke", function(d: any) {
          return d._children ? "#000" : color(d.depth);
        })
        .attr("stroke-width", function(d: any) {
          return d._children ? 4 : 1;
        })
        .attr("stroke-dasharray", function(d: any) {
          return d._children || d.children ? "9, 3" : "0, 0";
        })
        .attr("cursor", function(d: any) {
          return d._children || d.children ? "pointer" : "default";
        });

      // Add labels for the nodes
      nodeEnter
        .append("text")
        .attr("class", "name")
        .classed("tree-map", true)
        .attr("dy", "0.65rem")
        .attr("y", "1.00rem")
        .attr("x", CIRCLE_RADIUS + 5)
        // .on("click", function(d: any, i: number) {
        //   // console.log("cliked", d.data);
        //   showDetailsOf$.next(d.data);
        //   d3.event.stopPropagation();
        // })
        .text(function(d: any) {
          return d.data.name;
        })
        .each(function(d: any) {
          let realText = d.data.name
            ? d.data.name.length > MAX_TEXT_LENGTH
              ? `${d.data.name.substr(0, MAX_TEXT_LENGTH)}...`
              : d.data.name
            : "(Empty)";
          uiService.wrap(
            d3.select(this),
            realText,
            d.data.tags,
            d.y / d.depth * 0.85,
            0.65
          );
        });

      nodeEnter
        .append("text")
        .attr("class", "accountable")
        .classed("tree-map", true)
        .attr("dy", "5")
        .attr("x", CIRCLE_RADIUS + 4)
        .html(function(d: any) {
          // let tagsSpan = d.data.tags.map((tag: Tag) => `<tspan class="dot-tags" fill=${tag.color}>&#xf02b</tspan>`).join("");
          return `
                            <tspan>${
                              d.data.accountable ? d.data.accountable.name : ""
                            }</tspan>`;
        });
      // .text(function (d: any) { return d.data.accountable ? d.data.accountable.name : ""; })
      // .on("click", function(d: any) {
      //   if (d.data.accountable) {
      //     // TODO : keep until migration of database towards shortids
      //     if (!d.data.accountable.shortid) {
      //       userFactory
      //         .get(d.data.accountable.user_id)
      //         .then(u => (d.data.accountable.shortid = u.shortid))
      //         .then(() => {
      //           router.navigateByUrl(
      //             `/map/${datasetId}/${slug}/u/${
      //               d.data.accountable.shortid
      //             }/${d.data.accountable.getSlug()}`
      //           );
      //         });
      //     }
      //     router.navigateByUrl(
      //       `/map/${datasetId}/${slug}/u/${
      //         d.data.accountable.shortid
      //       }/${d.data.accountable.getSlug()}`
      //     );
      //   }
      // });

      // UPDATE
      let nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", function(d: any) {
          return "translate(" + d.y + "," + d.x + ")";
        });

      // Update the node attributes and style
      nodeUpdate
        .select("circle.node.tree-map")
        .attr("r", 15)
        .attr("fill", function(d: any) {
          return d.data.accountable
            ? "url(#image" + d.data.id + ")"
            : d._children ? color(d.depth) : "#fff";
        })
        .style("stroke", function(d: any) {
          return d._children ? "#000" : color(d.depth);
        })
        .attr("stroke-width", function(d: any) {
          return d._children ? 4 : 1;
        })
        .attr("stroke-dasharray", function(d: any) {
          return d._children || d.children ? "9, 3" : "0, 0";
        })
        .attr("cursor", function(d: any) {
          return d._children || d.children ? "pointer" : "default";
        });

      nodeUpdate
        .select("text.name.tree-map")
        .text(function(d: any) {
          return d.data.name;
        })
        .each(function(d: any) {
          let realText = d.data.name
            ? d.data.name.length > MAX_TEXT_LENGTH
              ? `${d.data.name.substr(0, MAX_TEXT_LENGTH)}...`
              : d.data.name
            : "(Empty)";
          uiService.wrap(
            d3.select(this),
            realText,
            d.data.tags,
            d.y / d.depth * 0.85,
            0.65
          );
        });
      nodeUpdate.select("text.accountable.tree-map").html(function(d: any) {
        // let tagsSpan = d.data.tags.map((tag: Tag) => `<tspan class="dot-tags" fill=${tag.color}>&#xf02b</tspan>`).join("");

        return `
                        <tspan>${
                          d.data.accountable ? d.data.accountable.name : ""
                        }</tspan>`;
      });

      // Remove any exiting nodes
      let nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", function(d: any) {
          return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select("circle.tree-map").attr("r", 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select("text.tree-map").style("fill-opacity", 1e-6);

      g
        .selectAll("circle.tree-map")
        .on("mouseover", function(d: any) {
          d3.event.stopPropagation();

          let tooltip = d3.select(`div.arrow_box[id="${d.data.id}"]`);
          let matrix = this.getScreenCTM().translate(
            +this.getAttribute("cx"),
            +this.getAttribute("cy")
          );

          let TOOLTIP_HEIGHT = (tooltip.node() as HTMLElement).getBoundingClientRect()
            .height;
          let TOOLTIP_WIDTH = (tooltip.node() as HTMLElement).getBoundingClientRect()
            .width;
          console.log(window.pageYOffset, matrix);
          let left = window.pageXOffset + matrix.e - TOOLTIP_WIDTH / 2;
          let top =
            window.pageYOffset + matrix.f - TOOLTIP_HEIGHT - 10 - CIRCLE_RADIUS;
          let bottom = window.pageYOffset + matrix.f + 10 + CIRCLE_RADIUS;

          tooltip
            .style("left", `${left}px`)
            .style("top", () => {
              return top > 0 ? `${top}px` : `${bottom}px`;
            })
            .classed("show", true)
            .classed("arrow-top", top < 0)
            .classed("arrow-bottom", top >= 0)
            .on("click", function(d: any) {
              tooltip.classed("show", false);
            });
        })
        .on("mouseout", function(d: any) {
          let tooltip = d3.select(`div.arrow_box[id="${d.data.id}"]`);
          tooltip.classed("show", false);
        });

      // ****************** links section ***************************

      // Update the links...
      let link = g
        .selectAll("path.link.tree-map")
        .data(links, function(d: any) {
          return d.id;
        });

      // Enter any new links at the parent's previous position.
      let linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .classed("tree-map", true)
        .style("stroke", function(d: any) {
          return color(d.depth);
        })
        .attr("d", function(d: any) {
          let o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });

      // UPDATE
      let linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate
        .transition()
        .duration(duration)
        .style("stroke", function(d: any) {
          return color(d.depth);
        })
        .attr("d", function(d: any) {
          return diagonal(d, d.parent);
        });

      // Remove any exiting links
      link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function(d: any) {
          let o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function(d: any) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s: any, d: any) {
        let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

        return path;
      }

      // Toggle children on click.
      function click(d: any) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d, 250);
        // centerNode(d)
      }
    }
  }
}
