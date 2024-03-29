import { filter, combineLatest } from 'rxjs/operators';
import { URIService } from '../../../../shared/services/uri/uri.service';
import { DataService } from '../../services/data.service';
import { UserFactory } from '../../../../core/http/user/user.factory';
import { UIService } from '../../services/ui.service';
import { ColorService } from '@maptio-shared/services/color/color.service';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';
import { Initiative } from '../../../../shared/model/initiative.data';
import { SelectableTag, Tag } from '../../../../shared/model/tag.data';
import { IDataVisualizer } from '../../components/canvas/mapping.interface';
import { Router } from '@angular/router';
import {
  Subscription,
  Observable,
  Subject,
  BehaviorSubject,
  partition,
} from 'rxjs';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { partition as _partition } from 'lodash-es';
import { User } from '../../../../shared/model/user.data';
import { Team } from '../../../../shared/model/team.data';
import {
  MapSettingsService,
  MapSettings,
} from '../../services/map-settings.service';

import { transition } from 'd3-transition';
import { select, selectAll, event, mouse } from 'd3-selection';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { tree, hierarchy } from 'd3-hierarchy';
import { color } from 'd3-color';

const d3 = Object.assign(
  {},
  {
    transition,
    select,
    selectAll,
    event,
    mouse,
    zoom,
    zoomIdentity,
    zoomTransform,
    tree,
    hierarchy,
    color,
    getEvent() {
      return require('d3-selection').event;
    },
  }
);

@Component({
  selector: 'tree',
  templateUrl: './mapping.tree.component.html',
  styleUrls: ['./mapping.tree.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'w-100' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MappingTreeComponent implements OnInit, IDataVisualizer {
  public width: number;

  public datasetId: string;
  public teamId: string;
  public teamName: string;
  public authorityLabel: string;
  public settings: MapSettings;

  public height: number;

  public margin = 100;
  public translateX: number;
  public translateY: number;
  public scale: number;
  public tagsState: Array<SelectableTag>;

  public zoom$: Observable<number>;
  public selectableTags$: Observable<Array<SelectableTag>>;
  // public fontColor$: Observable<string>;
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;
  public isAllExpanded$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isAllCollapsed$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isReset$: Observable<boolean>;

  private zoomSubscription: Subscription;
  private dataSubscription: Subscription;
  private resetSubscription: Subscription;
  private tagsSubscription: Subscription;

  public TRANSITION_DURATION = 250;

  private svg: any;
  private g: any;
  private definitions: any;
  private zoomListener: any;
  public isLoading: boolean;
  public _seedColor: string;
  public _data: any;
  public hoveredNode: Initiative;
  public slug: string;
  public showContextMenuOf$: Subject<{
    initiatives: Initiative[];
    x: number;
    y: number;
    isReadOnlyContextMenu: boolean;
  }> = new Subject<{
    initiatives: Initiative[];
    x: number;
    y: number;
    isReadOnlyContextMenu: boolean;
  }>();

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  // public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{
    initiatives: Initiative[];
    isNameOnly: boolean;
  }> = new Subject<{ initiatives: Initiative[]; isNameOnly: boolean }>();

  public _isDisplayOptions = false;

  constructor(
    public colorService: ColorService,
    public uiService: UIService,
    public router: Router,
    private userFactory: UserFactory,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private uriService: URIService,
    private mapSettingsService: MapSettingsService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.init();
    this.dataSubscription = this.dataService
      .get()
      .pipe(
        combineLatest(
          this.selectableTags$,
          this.mapColor$,
          this.isAllExpanded$.asObservable(),
          this.isAllCollapsed$.asObservable()
        )
      )
      .subscribe(
        (complexData: [any, SelectableTag[], string, boolean, boolean]) => {
          const data = <any>complexData[0].initiative;
          this.datasetId = complexData[0].dataset.datasetId;
          this.settings = this.mapSettingsService.get(this.datasetId);
          this.teamName = complexData[0].team.name;
          this.authorityLabel = complexData[0].team.settings.authority;
          this.slug = data.getSlug();
          this.tagsState = complexData[1];
          this.setSeedColor(complexData[2]);
          this.setData(data);
          this.update(complexData[1], complexData[3], complexData[4]);
          this.isLoading = false;
          this.cd.markForCheck();
        }
      );
  }

  ngOnDestroy() {
    if (this.zoomSubscription) {
      this.zoomSubscription.unsubscribe();
    }
    if (this.resetSubscription) {
      this.resetSubscription.unsubscribe();
    }
    if (this.tagsSubscription) {
      this.tagsSubscription.unsubscribe();
    }
  }

  expandAllLink() {
    this.isAllExpanded$.next(true);
    this.isAllCollapsed$.next(false);
    this.ngOnInit();
    // this.update(this.tagsState, true)
  }

  collapseAllLink() {
    this.isAllCollapsed$.next(true);
    this.isAllExpanded$.next(false);
    this.ngOnInit();
  }

  init() {
    this.uiService.clean();

    // let margins = { top: 0, right: this.margin, bottom: this.margin, left: this.margin }

    // declares a tree layout and assigns the size
    // CAREFUL : width and height are reversed in this function
    d3.tree().size([this.width / 2, this.height]);
    const margin = 100;

    function zoomed() {
      g.attr('transform', d3.getEvent().transform);
    }

    const wheelDelta = () =>
      ((-d3.getEvent().deltaY * (d3.getEvent().deltaMode ? 120 : 1)) / 500) *
      2.5;

    const zooming = d3
      .zoom()
      .wheelDelta(wheelDelta)
      .scaleExtent([1 / 3, 3])
      .on('zoom', zoomed)
      .on('end', () => {
        const transform = d3.getEvent().transform;
        const tagFragment = this.tagsState
          .filter((t) => t.isSelected)
          .map((t) => t.shortid)
          .join(',');
        // location.hash = this.uriService.buildFragment(
        //   new Map([
        //     ["x", transform.x],
        //     ["y", transform.y],
        //     ["scale", transform.k],
        //     ["tags", tagFragment]
        //   ])
        // );
      });

    const svg: any = d3
      .select('svg#map')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('class', 'overlay');

    // let innerSvg = svg.append("svg")
    //   .attr("width", "100%")
    //   .attr("height", "100%")
    //   .attr("x", "200px")
    //   .attr("x", this.uiService.getCenteredMargin())
    //   .style("overflow", "visible");

    const definitions = svg.append('defs');

    const g = svg
      .append('g')
      .attr('transform', `translate(${0}, ${this.height / 2}) scale(${1})`);

    try {
      // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
      svg.call(
        zooming.transform,
        d3.zoomIdentity.translate(0, this.height / 2).scale(1)
      );
      svg.call(zooming);
    } catch (error) {}

    this.resetSubscription = this.isReset$
      .pipe(filter((r) => r))
      .subscribe((isReset) => {
        svg
          .transition()
          .duration(this.TRANSITION_DURATION)
          .call(
            zooming.transform,
            d3.zoomIdentity.translate(
              document.querySelector('svg#map').clientWidth / 4,
              this.height / 2
            )
          );
      });

    this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
      try {
        // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
        if (zf) {
          zooming.scaleBy(
            svg.transition().duration(this.TRANSITION_DURATION),
            zf
          );
        } else {
          svg
            .transition()
            .duration(this.TRANSITION_DURATION)
            .call(
              zooming.transform,
              d3.zoomIdentity.translate(0, this.height / 2)
            );
        }
      } catch (error) {}
    });

    const [clearSearchInitiative, highlightInitiative] = partition(
      this.zoomInitiative$,
      (node) => node === null
    );

    highlightInitiative
      .pipe(combineLatest(this.mapColor$))
      .subscribe((zoomed: [any, string]) => {
        const node = zoomed[0];
        d3.selectAll(`g.node.tree-map`).classed('highlight', false);
        d3.selectAll('path.link').classed('highlight', false);

        d3.select(`g.node.tree-map[id~="${node.id}"]`).dispatch('expand');
        if (!this.getPathsToRoot().has(node.id)) return;

        this.getPathsToRoot()
          .get(node.id)
          .filter((id) => id !== node.id)
          .reverse()
          .forEach((nodeId) => {
            d3.select(`g.node.tree-map[id~="${nodeId}"]`).dispatch('expand');
            d3.select(`path.link[id-links~="${nodeId}"]`).classed(
              'highlight',
              true
            );
          });
        d3.select(`g.node.tree-map[id~="${node.id}"]`).classed(
          'highlight',
          true
        );
        d3.select(`path.link[id-links~="${node.id}"]`).classed(
          'highlight',
          true
        );
      });

    clearSearchInitiative.pipe(combineLatest(this.mapColor$)).subscribe(() => {
      d3.selectAll(`g.node.tree-map`).classed('highlight', false);
      d3.selectAll('path.link').classed('highlight', false);
    });

    this.svg = svg;
    this.g = g;
    this.definitions = definitions;
    this.zoomListener = zooming;
  }

  setSeedColor(color: string) {
    this._seedColor = color;
  }

  getSeedColor() {
    return this._seedColor;
  }

  setData(data: any) {
    this._data = data;
  }

  getData() {
    return this._data;
  }

  private _pathsToRoot: Map<number, number[]> = new Map();

  setPathsToRoot(paths: Map<number, number[]>) {
    this._pathsToRoot = paths;
  }

  getPathsToRoot() {
    return this._pathsToRoot;
  }

  update(
    tags: Array<SelectableTag>,
    isAllExpanded: boolean,
    isAllCollapsed: boolean
  ) {
    if (d3.selectAll('g').empty()) {
      this.init();
    }

    const margin = this.margin;
    const colorService = this.colorService;
    const uiService = this.uiService;
    const mapSettingsService = this.mapSettingsService;
    const settings = this.settings;
    const CIRCLE_RADIUS = 16;
    const CIRCLE_MARGIN = 5;
    const TRANSITION_DURATION = this.TRANSITION_DURATION;
    const viewerWidth = this.width;
    const viewerHeight = this.height;
    const datasetId = this.datasetId;
    const authorityLabel = this.authorityLabel;
    const router = this.router;
    const userFactory = this.userFactory;
    const showDetailsOf$ = this.showDetailsOf$;
    const canOpenInitiativeContextMenu =
      this.permissionsService.canOpenInitiativeContextMenu();
    const showContextMenuOf$ = this.showContextMenuOf$;
    const showToolipOf$ = this.showToolipOf$;
    const g = this.g;
    const svg = this.svg;
    const definitions = this.definitions;
    const zoomListener = this.zoomListener;
    const datasetSlug = this.slug;
    const teamName = this.teamName;
    const setPathsToRoot = this.setPathsToRoot.bind(this);
    const getSeedColor = this.getSeedColor.bind(this);
    const getData = this.getData.bind(this);
    const FADED_OPACITY = 0.1;

    function traverse(node: any, callback: (n: any) => void): void {
      if (node.children) {
        node.children.forEach(function (child: Initiative) {
          callback.apply(this, [child]);
          traverse(child, callback);
        });
      }
      callback.apply(this, [node]);
    }

    const treemap = d3
      .tree()
      .size([viewerWidth / 2, viewerHeight])
      .nodeSize([80, 1]);

    let i = 0,
      // duration = 750,
      root: any,
      list: any[];

    // Assigns parent, children, height, depth
    (root = d3.hierarchy(getData(), function (d) {
      return d.children;
    })),
      (list = d3.hierarchy(getData()).descendants());
    root.x0 = viewerHeight;
    root.y0 = 0;
    root.data.accountable = new User({ name: teamName, picture: '' });

    const pathsToRoot: Map<string, string[]> = new Map();
    root.eachAfter(function (n: any) {
      pathsToRoot.set(
        n.data.id,
        n.ancestors().map((a: any) => a.data.id)
      );
    });
    setPathsToRoot(pathsToRoot);

    traverse(root, (n: any) => {
      // if (settings.views.tree.expandedNodesIds.indexOf(n.data.id) > -1) {
      //   expand(n)
      // }
      // if (settings.views.tree.expandedNodesIds.indexOf(n.data.id) == -1) {
      //   collapse(n)
      // }
      if (isAllExpanded) expand(n);
      if (isAllCollapsed) {
        if (n.depth >= 1) collapse(n);
      }
    });

    updateGraph(root, 0);

    // Collapse the node and all it's children
    function collapse(d: any) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
        // updateState(d)
      }
    }

    function expand(d: any) {
      if (d._children) {
        d.children = d._children;
        d._children = null;
        // updateState(d);
      }
    }

    function updateState(source: any) {
      // save state in local storage
      if (source.children) {
        if (settings.views.tree.expandedNodesIds.indexOf(source.data.id) < 0) {
          settings.views.tree.expandedNodesIds.push(source.data.id);
        }
      }
      if (!source.children) {
        const ix = settings.views.tree.expandedNodesIds.indexOf(source.data.id);
        if (ix >= 0) {
          settings.views.tree.expandedNodesIds.splice(ix, 1);
        }
      }
      mapSettingsService.set(datasetId, settings);
    }

    function updateGraph(source: any, duration: number) {
      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s: any, d: any) {
        const path = `M ${s.y} ${s.x}
        C ${(s.y + d.y) / 2} ${s.x},
          ${(s.y + d.y) / 2} ${d.x},
          ${d.y} ${d.x}`;

        return path;
      }

      function centerNode(source: any) {
        const t = d3.zoomTransform(svg.node());
        let x = -source.y0;
        let y = -source.x0;
        x = x * t.k + margin; //+ viewerWidth / 2;
        y = y * t.k + viewerHeight / 2;
        svg
          .transition()
          .call(
            zoomListener.transform,
            d3.zoomIdentity.translate(x, y).scale(t.k)
          );
      }

      // Toggle children on click.
      function click(d: any) {
        if (d.children) {
          collapse(d);
        } else {
          expand(d);
        }
        updateGraph(d, TRANSITION_DURATION);
        centerNode(d);
        if (d !== root)
          showToolipOf$.next({ initiatives: [d.data], isNameOnly: false });
      }

      updateState(source);

      // Assigns the x and y position for the nodes
      const treeData = treemap(root);

      // Compute the new tree layout.
      const nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function (d: any) {
        d.y = d.depth * 250;
        d.x = d.x * 1.4;
      });

      // ****************** Nodes section ***************************

      // Update the nodes...
      const node = g
        .selectAll('g.node.tree-map')
        .data(nodes, function (d: any) {
          return d.id || (d.id = ++i);
        })
        .attr('id', (d: any) => d.data.id);
      const [selectedTags, unselectedTags] = _partition(
        tags,
        (t) => t.isSelected
      );

      g.selectAll('g.node.tree-map').style('opacity', function (d: any) {
        return uiService.filter(
          selectedTags,
          unselectedTags,
          d.data.tags.map((t: Tag) => t.shortid)
        )
          ? // &&
            // uiService.filter(selectedUsers, unselectedUsers, _.compact(_.flatten([...[d.data.accountable], d.data.helpers])).map(u => u.shortid))
            1
          : FADED_OPACITY;
      });

      const patterns = definitions
        .selectAll('pattern')
        .data(nodes, function (d: any) {
          return d.data.id;
        });
      const enterPatterns = patterns.enter().append('pattern');

      enterPatterns
        .merge(patterns)
        .filter(function (d: any) {
          return d.data.accountable;
        })
        .attr('id', function (d: any) {
          return 'i-' + d.data.id;
        })
        .attr('width', '100%')
        .attr('height', '100%')
        .append('image')

        .attr('x', 0)
        .attr('y', 0)
        .attr('width', CIRCLE_RADIUS * 2)
        .attr('height', CIRCLE_RADIUS * 2)
        .attr('xlink:href', function (d: any) {
          return d.data.accountable ? d.data.accountable.picture : '';
        });
      patterns.exit().remove();

      // Enter any new modes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('id', (d: any) => d.data.id)
        .classed('tree-map', true)
        .attr('tags-id', function (d: any) {
          return d.data.tags.map((t: Tag) => t.shortid).join(',');
        })
        .attr('transform', function (d: any) {
          return 'translate(' + source.y0 + ',' + source.x0 + ')';
        })
        .on('click', click)
        .on('expand', (d: any) => {
          expand(d);
          updateGraph(d, TRANSITION_DURATION);
        });

      // Add Circle for the nodes
      nodeEnter
        .append('circle')
        .attr('class', 'node')
        .classed('tree-map', true)
        .attr('r', 1e-4)
        .style('fill', function (d: any) {
          return d.data.accountable
            ? 'url(#i-' + d.data.id + ')'
            : d.children
            ? getSeedColor()
            : '#fff';
        })
        .style('stroke', function (d: any) {
          return d._children
            ? getSeedColor()
            : d3.color(getSeedColor()).darker(1).toString();
        })
        .attr('stroke-width', function (d: any) {
          return d._children || d.children ? 4 : 1;
        })
        .attr('cursor', function (d: any) {
          return d._children || d.children ? 'pointer' : 'default';
        });

      // Add labels for the nodes
      nodeEnter
        .append('foreignObject')
        .attr('class', 'name')
        .classed('tree-map', true)
        .attr('width', 170)
        .attr('height', 75)
        .style('display', 'inline')
        // .attr("dy", "0.65em")
        .attr('y', '0.5em')
        // .attr("y", (d: any) => d.data.tags && d.data.tags.length > 0 ? `2.00em` : `1.00em`)
        .attr('x', CIRCLE_RADIUS * 2 + CIRCLE_MARGIN)
        .html(function (d: any) {
          const tagsSpan = d.data.tags
            .map(
              (tag: Tag) =>
                `<i class="fas fa-tag me-1" style="color: ${tag.color};"></i>`
            )
            .join('');
          return `<div class="small">${
            d.data.name || '(Empty)'
          }<span class="mx-1">${tagsSpan}</span></div>`;
        });

      nodeEnter
        .append('text')
        .attr('class', 'accountable')
        .classed('tree-map', true)
        .attr('dy', '5')
        .attr('x', CIRCLE_RADIUS * 2 + CIRCLE_MARGIN)
        .html(function (d: any) {
          return `<tspan>${
            d.data.accountable
              ? d.data.accountable.name
              : `No ${authorityLabel}`
          }</tspan>`;
        });

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate
        .transition()
        .duration(duration)
        .attr('transform', function (d: any) {
          return 'translate(' + d.y + ',' + d.x + ')';
        })
        .attr('descendants-id', (d: any) =>
          d._children ? d.descendantIds : ''
        );

      // Update the node attributes and style
      nodeUpdate
        .select('circle.node.tree-map')
        .attr('r', CIRCLE_RADIUS)
        .attr('cx', CIRCLE_RADIUS)
        .style('fill', function (d: any) {
          return d.data.accountable
            ? 'url(#i-' + d.data.id + ')'
            : d._children
            ? getSeedColor()
            : '#fff';
        })
        .style('stroke', function (d: any) {
          return d._children
            ? getSeedColor()
            : d3.color(getSeedColor()).darker(1).toString();
        })
        .attr('stroke-width', function (d: any) {
          return d._children || d.children ? 4 : 1;
        })
        .attr('cursor', function (d: any) {
          return d._children || d.children ? 'pointer' : 'default';
        });

      nodeUpdate
        .select('foreignObject.name.tree-map')
        .attr('y', '0.5em')
        .attr('width', 170)
        .attr('height', 75)
        .style('display', 'inline')
        .html(function (d: any) {
          const tagsSpan = d.data.tags
            .map(
              (tag: Tag) =>
                `<i class="fas fa-tag me-1" style="color: ${tag.color};"></i>`
            )
            .join('');

          return `<div class="small">${
            d.data.name || '(Empty)'
          }<span class="mx-1">${tagsSpan}</span></div>`;
        });
      nodeUpdate.select('text.accountable.tree-map').html(function (d: any) {
        return `
                        <tspan>${
                          d.data.accountable
                            ? d.data.accountable.name
                            : `No ${authorityLabel}`
                        }</tspan>`;
      });

      // Remove any exiting nodes
      const nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', function (d: any) {
          return 'translate(' + source.y + ',' + source.x + ')';
        })
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle.tree-map').attr('r', 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select('text.tree-map').style('fill-opacity', 1e-6);

      g.selectAll('g.node.tree-map')
        .on('mouseover', function (d: any) {
          d3.getEvent().stopPropagation();
          // showToolipOf$.next({ initiatives: [d.data], isNameOnly: false });
        })
        .on('mouseout', function (d: any) {
          // showToolipOf$.next({ initiatives: null, isNameOnly: false });
          showContextMenuOf$.next({
            initiatives: null,
            x: 0,
            y: 0,
            isReadOnlyContextMenu: true,
          });
        })
        .on('contextmenu', function (d: any) {
          if (!canOpenInitiativeContextMenu) return;

          d3.getEvent().preventDefault();
          const mousePosition = d3.mouse(this);
          const matrix = this.getCTM().translate(
            +this.getAttribute('cx'),
            +this.getAttribute('cy')
          );

          const mouse = { x: mousePosition[0] + 3, y: mousePosition[1] + 3 };
          const initiative = d.data;

          const circle = d3.select(this);
          showContextMenuOf$.next({
            initiatives: [initiative],
            x: uiService.getContextMenuCoordinates(mouse, matrix).x,
            y: uiService.getContextMenuCoordinates(mouse, matrix).y,
            isReadOnlyContextMenu: true,
          });

          d3.select('.context-menu')
            .on('mouseenter', function (d: any) {
              showContextMenuOf$.next({
                initiatives: [initiative],
                x: uiService.getContextMenuCoordinates(mouse, matrix).x,
                y: uiService.getContextMenuCoordinates(mouse, matrix).y,
                isReadOnlyContextMenu: true,
              });
              circle.dispatch('mouseover');
            })
            .on('mouseleave', function (d: any) {
              showContextMenuOf$.next({
                initiatives: null,
                x: 0,
                y: 0,
                isReadOnlyContextMenu: true,
              });
              circle.dispatch('mouseout');
            });
        });

      // ****************** links section ***************************

      // Update the links...
      const link = g
        .selectAll('path.link.tree-map')
        .data(links, function (d: any) {
          return d.id;
        });

      // Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .classed('tree-map', true)
        .style('stroke-opacity', 0.5)
        .style('stroke-width', '2.5px')
        .style('fill', 'none')
        .style('stroke', function (d: any) {
          return getSeedColor();
        })
        .attr('d', function (d: any) {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        })
        .attr('id-links', function (d: any) {
          return [d.data.id, d.parent.data.id].join(' ');
        });

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate
        .transition()
        .duration(duration)
        .style('stroke-opacity', 0.5)
        .style('stroke', function (d: any) {
          return getSeedColor();
        })
        .attr('d', function (d: any) {
          return diagonal(d, d.parent);
        })
        .attr('id-links', function (d: any) {
          return [d.data.id, d.parent.data.id].join(' ');
        })
        .on('end', function (d: any) {});

      // Remove any exiting links
      link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', function (d: any) {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function (d: any) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }
  }
}
