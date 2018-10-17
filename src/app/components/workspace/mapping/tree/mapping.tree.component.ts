import { URIService } from "./../../../../shared/services/uri.service";
import { DataService } from "./../../../../shared/services/data.service";
import { UserFactory } from "./../../../../shared/services/user.factory";
import { UIService } from "./../../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../../shared/services/ui/color.service";
import { Angulartics2Mixpanel } from "angulartics2";
import { Initiative } from "./../../../../shared/model/initiative.data";
import { SelectableTag, Tag } from "./../../../../shared/model/tag.data";
import { IDataVisualizer } from "./../../mapping/mapping.interface";
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
import { partition } from "lodash";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

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
  public toggleOptions$: Observable<Boolean>;
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
  public TRANSITION_DURATION = 250;

  private svg: any;
  private g: any;
  private definitions: any;
  public isLoading: boolean;

  public hoveredNode: Initiative;
  public slug: string;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<Initiative> = new Subject<Initiative>();
  public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();
  public moveInitiative$: Subject<{
    node: Initiative;
    from: Initiative;
    to: Initiative;
  }> = new Subject<{ node: Initiative; from: Initiative; to: Initiative }>();
  public closeEditingPanel$: Subject<boolean> = new Subject<boolean>();


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

    // let margins = { top: 0, right: this.margin, bottom: this.margin, left: this.margin }

    // declares a tree layout and assigns the size
    // CAREFUL : width and height are reversed in this function
    d3.tree().size([this.width / 2, this.height]);

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
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")

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
        svg.attr("font-size", format[0] + "em");
        svg.selectAll("text").attr("font-size", format[0] + "em");
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
    } catch (error) { }

    this.resetSubscription = this.isReset$.filter(r => r).subscribe(isReset => {
      svg.transition().duration(this.TRANSITION_DURATION).call(
        zooming.transform,
        d3.zoomIdentity.translate(this.width / 10, this.height / 2)
      );
    });

    this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
      try {
        // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
        if (zf) {
          zooming.scaleBy(svg.transition().duration(this.TRANSITION_DURATION), zf);
        } else {
          svg.transition().duration(this.TRANSITION_DURATION).call(
            zooming.transform,
            d3.zoomIdentity.translate(this.translateX, this.translateY)
          );
        }
      } catch (error) { }
    });

    let [clearSearchInitiative, highlightInitiative] = this.zoomInitiative$.partition(node => node === null);

    highlightInitiative.combineLatest(this.mapColor$, this.fontColor$).subscribe((zoomed: [any, string, string]) => {
      let node = zoomed[0];
      let mapColor = zoomed[1];
      let fontColor = zoomed[2];
      d3.selectAll(`g.node.tree-map`).style("fill", fontColor);
      d3.select(`g.node.tree-map[id~="${node.id}"]`).dispatch("expand")
      if (!this.getPathsToRoot().has(node.id)) return;
      this.getPathsToRoot().get(node.id).filter(id => id !== node.id).reverse().forEach(nodeId => {
        d3.select(`g.node.tree-map[id~="${nodeId}"]`).dispatch("expand");
      })
      let gNode = d3.select(`g.node.tree-map[id~="${node.id}"]`)
      gNode.style("fill", mapColor);
    });

    clearSearchInitiative.combineLatest(this.mapColor$, this.fontColor$).subscribe(() => {
      let node = zoomed[0];
      let mapColor = zoomed[1];
      let fontColor = zoomed[2];
      d3.selectAll(`g.node.tree-map`).style("fill", fontColor);
    })

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
          action: "viewing",
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


  private _pathsToRoot: Map<number, number[]> = new Map();

  setPathsToRoot(paths: Map<number, number[]>) {
    this._pathsToRoot = paths;
  }

  getPathsToRoot() {
    return this._pathsToRoot;
  }


  update(data: any, tags: Array<SelectableTag>, seedColor: string) {
    if (this.d3.selectAll("g").empty()) {
      this.init();
    }

    let d3 = this.d3;
    let colorService = this.colorService;
    let uiService = this.uiService;
    let CIRCLE_RADIUS = 15;
    let TRANSITION_DURATION = this.TRANSITION_DURATION;
    let viewerWidth = this.width;
    let viewerHeight = this.height;
    let datasetId = this.datasetId;
    let router = this.router;
    let userFactory = this.userFactory;
    let showDetailsOf$ = this.showDetailsOf$;
    let showToolipOf$ = this.showToolipOf$;
    let g = this.g;
    let svg = this.svg;
    let definitions = this.definitions;
    let datasetSlug = this.slug;
    let setPathsToRoot = this.setPathsToRoot.bind(this)

    let treemap = d3
      .tree()
      .size([viewerWidth / 2, viewerHeight])
      .nodeSize([80, 1]);

    let i = 0,
      // duration = 750,
      root: any,
      list: any[];

    // Assigns parent, children, height, depth
    root = d3.hierarchy(data, function (d) {
      return d.children;
    }),
      list = d3.hierarchy(data).descendants();
    root.x0 = viewerHeight;
    root.y0 = 0;


    let depth = 0;
    root.eachAfter(function (n: any) {
      depth = depth > n.depth ? depth : n.depth;
    });
    let color = colorService.getColorRange(depth, seedColor);

    let pathsToRoot: Map<string, string[]> = new Map();
    root.eachAfter(function (n: any) {
      pathsToRoot.set(n.data.id, n.ancestors().map((a: any) => a.data.id));
    });
    setPathsToRoot(pathsToRoot)

    // Collapse after the third level
    if (root.children) {
      root.children.forEach((c: any) => {
        if (c.children) c.children.forEach(collapse);
      });
    }

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

    function expand(d: any) {
      if (d._children) {
        d.children = d._children;
        // d.children.forEach(expand);
        d._children = null;
      }
    }


    function update(source: any, duration: number) {

      // Assigns the x and y position for the nodes
      let treeData = treemap(root);

      // Compute the new tree layout.
      let nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function (d: any) {
        d.y = d.depth * 200;
        d.x = d.x * 1.4;
      });

      /*
      let tooltip = d3
        .select("body")
        .selectAll("div.arrow_box")
        .data(nodes, function (d: any) {
          return d.data.id;
        });


      tooltip.exit().remove();

      tooltip = tooltip.enter()
        .append("div")
        .attr("class", "arrow_box")
        .classed("show", false)
        .merge(tooltip)
        .attr("id", function (d: any) {
          return `${d.data.id}`;
        })
        .on("mouseenter", function () {
          d3.select(this).classed("show", true);
        })
        .on("mouseleave", function () {
          tooltip.classed("show", false);
        })
        .html(function (d: any) {
          return uiService.getTooltipHTML(d.data);
        });

        */

      d3.selectAll(`.open-initiative`).on("click", function (d: any) {
        let id = Number.parseFloat(d3.select(this).attr("id"));
        showDetailsOf$.next(list.find(n => (<any>n.data).id === id).data);
      });
      d3.selectAll(`.open-summary`).on("click", function (d: any) {
        let shortid = d3.select(this).attr("data-shortid");
        let slug = d3.select(this).attr("data-slug");
        router.navigateByUrl(
          `/map/${datasetId}/${datasetSlug}/u/${shortid}/${slug}`
        );
      });

      // ****************** Nodes section ***************************

      // Update the nodes...
      // console.log(g)
      let node = g.selectAll("g.node.tree-map")
        .data(nodes, function (d: any) {
          return d.id || (d.id = ++i);
        })
        .attr("id", (d: any) => d.data.id)
        ;
      let [selectedTags, unselectedTags] = partition(tags, t => t.isSelected);

      g.selectAll("g.node.tree-map").style("opacity", function (d: any) {
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

      let patterns = definitions
        .selectAll("pattern")
        .data(nodes, function (d: any) {
          return d.data.id;
        });
      let enterPatterns = patterns.enter().append("pattern");

      enterPatterns
        .merge(patterns)
        .filter(function (d: any) {
          return d.data.accountable;
        })
        .attr("id", function (d: any) {
          return "image" + d.data.id;
        })
        .attr("width", "100%")
        .attr("height", "100%")
        .append("image")
        .attr("width", CIRCLE_RADIUS * 2)
        .attr("height", CIRCLE_RADIUS * 2)
        .attr("xlink:href", function (d: any) {
          return d.data.accountable ? d.data.accountable.picture : "";
        });
      patterns.exit().remove();

      // Enter any new modes at the parent's previous position.
      let nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", (d: any) => d.data.id)
        .classed("tree-map", true)
        .attr("tags-id", function (d: any) {
          return d.data.tags.map((t: Tag) => t.shortid).join(",");
        })
        .attr("transform", function (d: any) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click)
        .on("expand", (d: any) => {
          // console.log("expanding", d.data.id, d.data.name)
          expand(d);
          update(d, TRANSITION_DURATION)
        })

      // Add Circle for the nodes
      nodeEnter
        .append("circle")
        .attr("class", "node")
        .classed("tree-map", true)
        .attr("r", 1e-4)
        .attr("fill", function (d: any) {
          return d.data.accountable
            ? "url(#image" + d.data.id + ")"
            : d.children ? color(d.depth) : "#fff";
        })
        .style("stroke", function (d: any) {
          return d._children ? "#000" : color(d.depth);
        })
        .attr("stroke-width", function (d: any) {
          return d._children ? 4 : 1;
        })
        .attr("stroke-dasharray", function (d: any) {
          return d._children || d.children ? "9, 3" : "0, 0";
        })
        .attr("cursor", function (d: any) {
          return d._children || d.children ? "pointer" : "default";
        });

      nodeEnter
        .append("text")
        .attr("class", "tags")
        .classed("tree-map", true)


      // Add labels for the nodes
      nodeEnter
        .append("text")
        .attr("class", "name")
        .classed("tree-map", true)
        .attr("dy", "0.65em")
        .attr("y", (d: any) => d.data.tags && d.data.tags.length > 0 ? `2.00em` : `1.00em`)
        .attr("x", CIRCLE_RADIUS + 5)
        .text(function (d: any) {
          return d.data.name;
        })
        .each(function (d: any) {
          let realText = d.data.name
            ? d.data.name
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
        .html(function (d: any) {
          // let tagsSpan = d.data.tags.map((tag: Tag) => `<tspan class="dot-tags" fill=${tag.color}>&#xf02b</tspan>`).join("");
          return `<tspan>${d.data.accountable ? d.data.accountable.name : ""}</tspan>`;
        });

      // UPDATE
      let nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", function (d: any) {
          return "translate(" + d.y + "," + d.x + ")";
        })
        .attr("descendants-id", (d: any) => d._children ? d.descendantIds : "");

      // Update the node attributes and style
      nodeUpdate
        .select("circle.node.tree-map")
        .attr("r", 15)
        .attr("fill", function (d: any) {
          return d.data.accountable
            ? "url(#image" + d.data.id + ")"
            : d._children ? color(d.depth) : "#fff";
        })
        .style("stroke", function (d: any) {
          return d._children ? "#000" : color(d.depth);
        })
        .attr("stroke-width", function (d: any) {
          return d._children ? 4 : 1;
        })
        .attr("stroke-dasharray", function (d: any) {
          return d._children || d.children ? "9, 3" : "0, 0";
        })
        .attr("cursor", function (d: any) {
          return d._children || d.children ? "pointer" : "default";
        });

      nodeUpdate.select("text.tags.tree-map")
        .attr("dy", "0.65em")
        .attr("y", "1.00em")
        .attr("x", CIRCLE_RADIUS + 5)
        .html(function (d: any) {
          return d.data.tags.map((tag: Tag) => `<tspan fill="${tag.color}" class="dot-tags">&#xf02b</tspan><tspan fill="${tag.color}">${tag.name}</tspan>`).join(" ");
        });

      nodeUpdate
        .select("text.name.tree-map")
        .attr("y", (d: any) => d.data.tags && d.data.tags.length > 0 ? `2.00em` : `1.00em`)
        .text(function (d: any) {
          return d.data.name;
        })
        .each(function (d: any) {
          // console.log(d.data.id, d.data.name)
          let realText = d.data.name
            ? d.data.name
            : "(Empty)";
          uiService.wrap(
            d3.select(this),
            realText,
            d.data.tags,
            d.y / d.depth * 0.85,
            0.65
          );
        });
      nodeUpdate.select("text.accountable.tree-map").html(function (d: any) {
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
        .attr("transform", function (d: any) {
          return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select("circle.tree-map").attr("r", 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select("text.tree-map").style("fill-opacity", 1e-6);

      g
        .selectAll("g.node.tree-map")
        .on("mouseover", function (d: any) {
          d3.event.stopPropagation();
          showToolipOf$.next(d.data)
          /*
          let tooltip = d3.select(`div.arrow_box[id="${d.data.id}"]`);
          let matrix = this.getScreenCTM().translate(
            +this.getAttribute("cx"),
            +this.getAttribute("cy")
          );

          let TOOLTIP_HEIGHT = (tooltip.node() as HTMLElement).getBoundingClientRect()
            .height;
          let TOOLTIP_WIDTH = (tooltip.node() as HTMLElement).getBoundingClientRect()
            .width;

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
            .on("click", function (d: any) {
              tooltip.classed("show", false);
            });
            */
        })
        .on("mouseout", function (d: any) {
          showToolipOf$.next(null)
          // let tooltip = d3.select(`div.arrow_box[id="${d.data.id}"]`);
          // tooltip.classed("show", false);
        });

      // ****************** links section ***************************

      // Update the links...
      let link = g
        .selectAll("path.link.tree-map")
        .data(links, function (d: any) {
          return d.id;
        });

      // Enter any new links at the parent's previous position.
      let linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .classed("tree-map", true)
        .style("stroke", function (d: any) {
          return color(d.depth);
        })
        .attr("d", function (d: any) {
          let o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });

      // UPDATE
      let linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate
        .transition()
        .duration(duration)
        .style("stroke", function (d: any) {
          return color(d.depth);
        })
        .attr("d", function (d: any) {
          return diagonal(d, d.parent);
        });

      // Remove any exiting links
      link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function (d: any) {
          let o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function (d: any) {
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
        update(d, TRANSITION_DURATION);
        // centerNode(d)
      }


    }
  }
}
