import { filter, combineLatest, map } from 'rxjs/operators';
import { Team } from '../../../../shared/model/team.data';
import { Role } from '../../../../shared/model/role.data';
import { User } from '../../../../shared/model/user.data';
import { ColorService } from '@maptio-shared/services/color/color.service';
import { UIService } from '../../services/ui.service';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { URIService } from '../../../../shared/services/uri/uri.service';
import { PermissionsService } from '../../../../shared/services/permissions/permissions.service';
import { Tag, SelectableTag } from '../../../../shared/model/tag.data';
import { Initiative } from '../../../../shared/model/initiative.data';
import { DatasetFactory } from '../../../../core/http/map/dataset.factory';
import {
  Subject,
  BehaviorSubject,
  Subscription,
  Observable,
  partition,
} from 'rxjs';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IDataVisualizer } from '../../components/canvas/mapping.interface';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import {
  flatten,
  uniqBy,
  remove,
  partition as _partition,
  groupBy,
  map as _map,
  flattenDeep,
} from 'lodash-es';

import { transition } from 'd3-transition';
import { select, selectAll, event, mouse } from 'd3-selection';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { tree, hierarchy, HierarchyNode } from 'd3-hierarchy';
import { color } from 'd3-color';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  ForceLink,
} from 'd3-force';
import { map as d3Map } from 'd3-collection';
import { drag } from 'd3-drag';
import {
  MapSettings,
  MapSettingsService,
} from '../../services/map-settings.service';

const d3 = Object.assign(
  {},
  {
    transition,
    select,
    selectAll,
    mouse,
    zoom,
    zoomIdentity,
    zoomTransform,
    tree,
    hierarchy,
    color,
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    d3Map,
    drag,
    getEvent() {
      return require('d3-selection').event;
    },
  }
);

@Component({
  selector: 'network',
  templateUrl: './mapping.network.component.html',
  styleUrls: ['./mapping.network.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingNetworkComponent implements OnInit, IDataVisualizer {
  public datasetId: string;
  public width: number;
  public height: number;
  public translateX: number;
  public translateY: number;
  public scale: number;
  public tagsState: Array<SelectableTag>;
  public settings: MapSettings;

  public margin: number;
  public selectableTags$: Observable<Array<SelectableTag>>;
  public zoom$: Observable<number>;
  // public fontColor$: Observable<string>;
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;
  // public isLocked$: Observable<boolean>;
  public isReset$: Observable<boolean>;

  public rootNode: Initiative;
  public slug: string;
  public team: Team;

  public _isDisplayOptions = false;
  private isAuthorityCentricMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );
  public _isAuthorityCentricMode = true;

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

  public hideOptions$: Subject<boolean> = new Subject<boolean>();
  public isOptionsVisible: boolean;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{
    initiatives: Initiative[];
    isNameOnly: boolean;
  }> = new Subject<{ initiatives: Initiative[]; isNameOnly: boolean }>();
  public analytics: Angulartics2Mixpanel;

  private zoomSubscription: Subscription;
  private dataSubscription: Subscription;
  private resetSubscription: Subscription;

  public isSaving: boolean;
  public dataset: any;

  T: any;
  TRANSITION_DURATION = 250;

  CIRCLE_RADIUS = 32;
  LINE_WEIGHT = 5;
  FADED_OPACITY = 0.05;
  private svg: any;
  private g: any;
  // private link: any;
  private fontSize: number;
  public tooltipInitiatives: Array<Initiative>;
  public tooltipRoles: Array<{ initiative: Initiative; role: Role }>;
  public tooltipSourceUser: User;
  public tooltipTargetUser: User;
  public isLoading: boolean;

  constructor(
    public colorService: ColorService,
    public uiService: UIService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private dataService: DataService,
    private uriService: URIService,
    private datasetFactory: DatasetFactory,
    private mapSettingsService: MapSettingsService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.init();

    this.dataSubscription = this.dataService
      .get()
      .pipe(
        map((dataset) => {
          this.datasetId = dataset.dataset.datasetId;
          this.settings = this.mapSettingsService.get(this.datasetId);
          this.isAuthorityCentricMode$.next(
            this.settings.views.network
              ? this.settings.views.network.isAuthorityCentricMode
              : true
          );
          return dataset;
        }),
        combineLatest(
          this.mapColor$,
          this.isAuthorityCentricMode$.asObservable()
        )
      )
      .subscribe(([dataset, color, authorityCentricMode]) => {
        this.dataset = dataset.dataset;

        const data = <any>dataset.initiative;
        this.rootNode = dataset.initiative;
        this.team = dataset.team;
        this.slug = data.getSlug();
        this._isAuthorityCentricMode = authorityCentricMode;
        this.update(data, color, this._isAuthorityCentricMode);
        this.analytics.eventTrack('Map', {
          action: 'viewing',
          view: 'connections',
          team: (<Team>dataset.team).name,
          teamId: (<Team>dataset.team).team_id,
        });
        this.isLoading = false;
        this.cd.markForCheck();
      });

    this.selectableTags$.subscribe((tags) => (this.tagsState = tags));
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
  }

  init() {
    this.uiService.clean();

    const svg: any = d3
      .select('svg#map')
      .attr('width', this.width)
      .attr('height', this.height);
    const g = svg
      .append('g')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr(
        'transform',
        `translate(${0}, ${-this.height / 4}) scale(${this.scale})`
      );
    g.append('g').attr('class', 'links');
    // g.append("g").attr("class", "labels");
    g.append('g').attr('class', 'nodes');
    g.append('defs');

    svg
      .append('svg:defs')
      .selectAll('marker')
      .data([
        { id: 'arrow', opacity: 1 },
        { id: 'arrow-fade', opacity: this.FADED_OPACITY },
        { id: 'arrow-hover', opacity: 1 },
      ])
      .enter()
      .append('marker')
      .attr('id', (d: any) => d.id)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('markerWidth', this.CIRCLE_RADIUS)
      .attr('markerHeight', this.CIRCLE_RADIUS)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .style('opacity', (d: any) => d.opacity);

    const wheelDelta = () =>
      ((-d3.getEvent().deltaY * (d3.getEvent().deltaMode ? 120 : 1)) / 500) *
      2.5;

    const zooming = d3
      .zoom()
      .wheelDelta(wheelDelta)
      .scaleExtent([1 / 10, 4])
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

    function zoomed() {
      g.attr('transform', d3.getEvent().transform);
    }

    try {
      // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
      // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
      svg.call(
        zooming.transform,
        d3.zoomIdentity.translate(0, -this.height / 4).scale(1)
      );
      svg.call(zooming);
    } catch (error) {}

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
              d3.zoomIdentity.translate(0, -this.height / 4)
            );
        }
      } catch (error) {}
    });

    this.resetSubscription = this.isReset$
      .pipe(filter((r) => r))
      .subscribe((isReset) => {
        svg
          .transition()
          .duration(this.TRANSITION_DURATION)
          .call(
            zooming.transform,
            d3.zoomIdentity.translate(0, -this.height / 4)
          );
      });

    const [clearSearchInitiative, highlightInitiative] = partition(
      this.zoomInitiative$,
      (node) => node === null
    );

    clearSearchInitiative
      .pipe(combineLatest(this.isAuthorityCentricMode$.asObservable()))
      .subscribe((zoomed: [Initiative, boolean]) => {
        const node = zoomed[0];
        const isAuthorityCentricMode = zoomed[1];

        g.selectAll('path.edge')
          .style('stroke-opacity', function (d: any) {
            return 1;
          })
          // .style("opacity", function (d: any) {
          //   return 1;
          // })
          .attr('marker-end', function (d: any) {
            if (isAuthorityCentricMode) return 'url(#arrow)';
          });
      });
    highlightInitiative
      .pipe(combineLatest(this.isAuthorityCentricMode$.asObservable()))
      .subscribe((zoomed: [Initiative, boolean]) => {
        const node = zoomed[0];
        const isAuthorityCentricMode = zoomed[1];
        const highlightElement = this.highlightElement;
        const FADED_OPACITY = this.FADED_OPACITY;

        g.selectAll('path.edge').each(function (d: any) {
          highlightElement(
            d3.select(this),
            d[4].includes(node.id),
            FADED_OPACITY,
            isAuthorityCentricMode
          );
        });
      });

    this.selectableTags$
      .pipe(combineLatest(this.isAuthorityCentricMode$.asObservable()))
      .subscribe((value) => {
        const tags = value[0];
        const isAuthorityCentricMode = value[1];
        const highlightElement = this.highlightElement;

        const [selectedTags, unselectedTags] = _partition(
          tags,
          (t) => t.isSelected
        );
        const uiService = this.uiService;
        const FADED_OPACITY = this.FADED_OPACITY;
        g.selectAll('path.edge').each(function (d: any) {
          highlightElement(
            d3.select(this),
            uiService.filter(selectedTags, unselectedTags, d[5]),
            FADED_OPACITY,
            isAuthorityCentricMode
          );
        });
      });

    this.svg = svg;
    this.g = g;
  }

  private highlightElement(
    element: any,
    isSelected: boolean,
    unselectedOpacity: number,
    isAuthorityCentricMode: boolean
  ) {
    element
      .style('stroke-opacity', function (d: any) {
        return isSelected ? 1 : unselectedOpacity;
      })
      .style('fill-opacity', function (d: any) {
        return isSelected ? 1 : unselectedOpacity;
      })
      // .style("opacity", function (d: any) {
      //   return isSelected ? 1 : unselectedOpacity;
      // })
      .attr('marker-end', function (d: any) {
        if (isAuthorityCentricMode) {
          return isSelected ? 'url(#arrow)' : 'url(#arrow-fade)';
        }
      });
  }

  private prepareAuthorityCentric(initiativeList: HierarchyNode<Initiative>[]) {
    const nodesRaw = initiativeList
      .map((d) => {
        const all = flatten([...[d.data.accountable], d.data.helpers]);
        return uniqBy(remove(all), (a) => {
          return a.user_id;
        });
      })
      .reduce((pre, cur) => {
        return [...pre, ...cur];
      })
      .map((u) => {
        return {
          name: u.name,
          id: u.user_id,
          picture: u.picture,
          shortid: u.shortid,
          slug: u.getSlug(),
        };
      });

    const rawlinks = initiativeList
      .map((i) => {
        return i.data;
      })
      .map((i) => {
        return i.helpers.map((h) => {
          if (i.accountable && h.user_id !== i.accountable.user_id)
            return {
              source: h.user_id,
              target: i.accountable ? i.accountable.user_id : undefined,
              type: 'helps',
              initiative: i.id,
              tags: i.tags,
            };
        });
      })
      .reduce((pre, cur) => {
        const reduced = remove([...pre, ...cur]);

        return reduced;
      })
      .map((l) => {
        return {
          linkid: `${l.source}-${l.target}`,
          source: l.source,
          target: l.target,
          initiative: l.initiative,
          type: l.type,
          tags: l.tags,
        };
      });

    const links = _map(
      groupBy(rawlinks, 'linkid'),
      (items: Array<any>, linkid: string) => {
        return {
          source: items[0].source,
          target: items[0].target,
          type: items[0].type,
          weight: items.length,
          initiatives: items.map((item: any) => item.initiative),
          tags: flattenDeep(items.map((item: any) => item.tags)).map(
            (t: Tag) => t.shortid
          ),
        };
      }
    );

    return {
      nodes: uniqBy(nodesRaw, (u) => {
        return u.id;
      }),
      links: links,
    };
  }

  private prepareHelperCentric(initiativeList: HierarchyNode<Initiative>[]) {
    const nodesRaw = initiativeList
      .map((d) => {
        const all = flatten([...[d.data.accountable], d.data.helpers]);
        return uniqBy(remove(all), (a) => {
          return a.user_id;
        });
      })
      .reduce((pre, cur) => {
        return [...pre, ...cur];
      })
      .map((u) => {
        return {
          name: u.name,
          id: u.user_id,
          picture: u.picture,
          shortid: u.shortid,
          slug: u.getSlug(),
        };
      });

    const rawlinks = initiativeList
      .map((i) => {
        return i.data;
      })
      .map((i) => {
        const allWorkers = remove(flatten([...[i.accountable], i.helpers]));

        const result: any[] = [];
        allWorkers.forEach((w, ix, arr) => {
          arr.forEach((o) => {
            if (o.user_id !== w.user_id) {
              result.push({
                source: w.user_id,
                target: o.user_id,
                type: 'works with',
                initiative: i.id,
                tags: i.tags,
              });
            }
          });
        });
        return result;
      })
      .reduce((pre, cur) => {
        const reduced = remove([...pre, ...cur]);

        return reduced;
      })
      .map((l) => {
        return {
          linkid:
            l.source < l.target
              ? `${l.source}-${l.target}`
              : `${l.target}-${l.source}`,
          source: l.source,
          target: l.target,
          initiative: l.initiative,
          type: l.type,
          tags: l.tags,
        };
      });

    const links = _map(
      groupBy(rawlinks, 'linkid'),
      (items: any, linkid: string) => {
        const uniqueItems = uniqBy(items, (i: any) => i.initiative);
        return {
          source: uniqueItems[0].source,
          target: uniqueItems[0].target,
          type: uniqueItems[0].type,
          weight: uniqueItems.length,
          initiatives: uniqueItems.map((item: any) => item.initiative),
          tags: flattenDeep(uniqueItems.map((item: any) => item.tags)).map(
            (t: Tag) => t.shortid
          ),
        };
      }
    );

    return {
      nodes: uniqBy(nodesRaw, (u) => {
        return u.id;
      }),
      links: links,
    };
  }

  getTags() {
    return this.tagsState;
  }

  public switch(value: boolean) {
    this.isAuthorityCentricMode$.next(value);
    this.saveChanges(value);
  }

  saveChanges(authorityCentricMode: boolean) {
    this.isSaving = true;
    const settings = this.settings;
    settings.views.network.isAuthorityCentricMode = authorityCentricMode;

    this.mapSettingsService.set(this.datasetId, settings);
    // this.dataset.initiative.authorityCentricMode = authorityCentricMode;

    if (!this.dataset) {
      return;
    }

    this.datasetFactory
      .upsert(this.dataset, this.dataset.datasetId)
      .then(
        (hasSaved: boolean) => {
          // this.dataService.set(this.dataset);
          return hasSaved;
        },
        (reason) => {
          console.error(reason);
        }
      )
      .then(() => {
        this.isSaving = false;
      });
  }

  public isNoNetwork: boolean;
  public setIsNoNodes() {
    this.isNoNetwork = true;
    this.cd.markForCheck();
  }

  public update(data: any, seedColor: string, isAuthorityCentricMode: boolean) {
    if (d3.selectAll('g').empty()) {
      this.init();
    }

    const g = this.g;
    const svg = this.svg;
    const fontSize = this.fontSize;
    const width = this.width;
    const height = this.height;
    const bilinks: Array<any> = [];
    const uiService = this.uiService;
    const showDetailsOf$ = this.showDetailsOf$;
    const showToolipOf$ = this.showToolipOf$;
    const canOpenInitiativeContextMenu = this.permissionsService.canOpenInitiativeContextMenu();
    const showContextMenuOf$ = this.showContextMenuOf$;
    const datasetSlug = this.slug;
    const datasetId = this.datasetId;
    const getTags = this.getTags.bind(this);
    const setIsNoNodes = this.setIsNoNodes.bind(this);
    const CIRCLE_RADIUS = this.CIRCLE_RADIUS;
    const LINE_WEIGHT = this.LINE_WEIGHT;
    const FADED_OPACITY = this.FADED_OPACITY;
    const hideOptions$ = this.hideOptions$;
    const highlightElement = this.highlightElement;

    const initiativesList: HierarchyNode<Initiative>[] = d3
      .hierarchy(data)
      .descendants();

    const graph = isAuthorityCentricMode
      ? this.prepareAuthorityCentric(initiativesList)
      : this.prepareHelperCentric(initiativesList);
    if (graph.nodes.length === 0) {
      setIsNoNodes();
      return;
    }

    const router = this.router;
    const slug = this.slug;

    const simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3.forceLink().id(function (d: any) {
          return d.id;
        })
      )
      .force(
        'charge',
        d3
          .forceManyBody()
          .distanceMax(400)
          .strength(function (d) {
            return -600;
          })
      )
      .force('center', d3.forceCenter(width / 2, height / 2));

    svg.selectAll('defs > marker').style('fill', seedColor);

    const patterns = g.select('defs').selectAll('pattern').data(graph.nodes);
    patterns
      .enter()
      .append('pattern')
      .merge(patterns)
      .attr('id', function (d: any) {
        return 'image' + d.id;
      })
      .attr('width', '100%')
      .attr('height', '100%')
      .append('image')
      .attr('width', CIRCLE_RADIUS * 2)
      .attr('height', CIRCLE_RADIUS * 2)
      .attr('xlink:href', function (d: any) {
        return d.picture;
      });

    const nodes = graph.nodes,
      nodeById = d3.d3Map(nodes, function (d: any) {
        return d.id;
      }),
      links = graph.links;

    const [selectedTags, unselectedTags] = _partition(
      getTags(),
      (t: SelectableTag) => t.isSelected
    );

    links.forEach(function (link: {
      source: string;
      target: string;
      weight: number;
      type: string;
      initiatives: Array<string>;
      tags: Array<string>;
    }) {
      const s = (link.source = <any>nodeById.get(link.source)),
        t = (link.target = <any>nodeById.get(link.target)),
        i = {},
        weight = link.weight,
        initiatives = link.initiatives,
        tags = link.tags,
        id = `${s.id}-${t.id}`,
        type = link.type; // intermediate node

      nodes.push(<any>i);
      links.push(<any>{ source: s, target: i }, <any>{ source: i, target: t });
      bilinks.push([s, i, t, weight, initiatives, tags, id, type]);
    });

    let link = g
      .select('g.links')
      .selectAll('path.edge')
      .data(bilinks, function (d: any) {
        return d[5];
      });
    link.exit().remove();

    link = link
      .enter()
      .append('path')
      .attr('class', 'edge')
      .merge(link)
      .attr('data-initiatives', function (d: any) {
        return d[4].join(' ');
      })
      .attr('data-tags', function (d: any) {
        return d[5].join(',');
      })
      .attr('data-source', function (d: any) {
        return d[0].id;
      })
      .attr('data-target', function (d: any) {
        return d[2].id;
      })
      .attr('stroke-width', function (d: any) {
        return `${LINE_WEIGHT * d[3]}px`;
      })
      // .style("opacity", function (d: any) {
      //   return uiService.filter(selectedTags, unselectedTags, d[5]) ? 1 : FADED_OPACITY;
      // })
      .style('stroke-opacity', function (d: any) {
        return uiService.filter(selectedTags, unselectedTags, d[5])
          ? 1
          : FADED_OPACITY;
      })
      .attr('id', function (d: any) {
        return d[6];
      })
      .attr('marker-end', function (d: any) {
        if (isAuthorityCentricMode)
          return uiService.filter(selectedTags, unselectedTags, d[5])
            ? 'url(#arrow)'
            : 'url(#arrow-fade)';
      });

    let node = g
      .select('g.nodes')
      .selectAll('g.node')
      .data(
        nodes.filter(function (d) {
          return d.id;
        })
      );
    node.exit().remove();

    node = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('id', (d: any) => d.id)
      .merge(node)
      .on('dblclick', releaseNode)
      .call(
        d3
          .drag<SVGElement, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    node.append('circle');
    node.append('text').attr('class', 'authority-name');

    node
      .select('circle')
      .attr('r', CIRCLE_RADIUS)
      .attr('fill', function (d: any) {
        return 'url(#image' + d.id + ')';
      })
      .attr('pointer-events', 'auto')
      .attr('cursor', 'move');

    node
      .select('text.authority-name')
      .attr('pointer-events', 'auto')
      .attr('cursor', 'pointer')
      // .style("font-weight", "initial")
      .attr('dx', CIRCLE_RADIUS + 3)
      .attr('dy', CIRCLE_RADIUS / 2)
      .text(function (d: any) {
        return d.name;
      });

    node
      .on('mouseover', function (d: any) {
        d3.select(this).style('fill', d3.color(seedColor).darker(1).toString());

        const sourceNode = `${d.id}`;
        let connectedNodes: string[] = [];
        let connectedInitiatives: number[] = [];
        // highlight connected paths
        g.selectAll(`path.edge`).each(function (d: any) {
          highlightElement(
            d3.select(this),
            d[0].id === sourceNode || d[2].id === sourceNode,
            FADED_OPACITY,
            isAuthorityCentricMode
          );
          if (d[0].id === sourceNode || d[2].id === sourceNode) {
            connectedNodes = connectedNodes.concat([d[0].id, d[2].id]);
            connectedInitiatives = connectedInitiatives.concat(d[4]);
          }
        });

        // highlight node
        g.selectAll(`g.node`).each(function (d: any) {
          highlightElement(
            d3.select(this),
            d.id === sourceNode || connectedNodes.indexOf(d.id) > -1,
            FADED_OPACITY,
            isAuthorityCentricMode
          );
        });

        const list = initiativesList
          .map((i) => i.data)
          .filter((i) => {
            return connectedInitiatives.indexOf(i.id) > -1;
          });

        // showToolipOf$.next({ initiatives: list, isNameOnly: true });

        hideOptions$.next(true);
      })
      .on('mouseout', function (d: any) {
        d3.select(this).style('fill', 'initial');
        g.selectAll('path.edge')
          .style('stroke-opacity', 1)
          .attr('marker-end', function (d: any) {
            if (isAuthorityCentricMode) {
              return 'url(#arrow)';
            }
          });

        g.selectAll(`g.node`).style('fill-opacity', 1);

        // showToolipOf$.next({ initiatives: null, isNameOnly: true });

        hideOptions$.next(false);
      })
      .on('click', function (d: any) {
        // showToolipOf$.next({ initiatives: null, isNameOnly: true });
        hideOptions$.next(false);

        router.navigateByUrl(
          `/map/${datasetId}/${slug}/directory?member=${d.shortid}`
        );
      });

    g.selectAll('path')
      .style('stroke-opacity', 1)
      .style('stroke', seedColor)
      .on('mouseover', function (d: any) {
        d3.getEvent().stopPropagation();

        const path = d3.select(this);
        path
          .style('stroke-opacity', 1)
          .style('stroke', d3.color(seedColor).darker(1).toString())
          .attr('marker-end', function (d: any) {
            if (isAuthorityCentricMode) return 'url(#arrow-hover)';
          });

        // let p = path
        //   .node()
        //   .getPointAtLength(0.5 * path.node().getTotalLength());

        const ids: any[] = d[4];

        const list = initiativesList
          .map((i) => i.data)
          .filter((i) => {
            return ids.indexOf(i.id) > -1;
          });

        // showToolipOf$.next({ initiatives: list, isNameOnly: true });

        hideOptions$.next(true);
      })
      .on('mouseout', function (d: any) {
        const path = d3.select(this);
        path
          .style('stroke-opacity', 1)
          .style('stroke', seedColor)
          .attr('marker-end', function (d: any) {
            if (isAuthorityCentricMode) return 'url(#arrow)';
          });
        // showToolipOf$.next({ initiatives: null, isNameOnly: true });

        hideOptions$.next(false);
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

        const ids: any[] = d[4];

        const list = initiativesList
          .map((i) => i.data)
          .filter((i) => {
            return ids.indexOf(i.id) > -1;
          });

        const path = d3.select(this);
        showContextMenuOf$.next({
          initiatives: list,
          x: uiService.getContextMenuCoordinates(mouse, matrix).x,
          y: uiService.getContextMenuCoordinates(mouse, matrix).y,
          isReadOnlyContextMenu: true,
        });

        d3.select('.context-menu')
          .on('mouseenter', function (d: any) {
            showContextMenuOf$.next({
              initiatives: list,
              x: uiService.getContextMenuCoordinates(mouse, matrix).x,
              y: uiService.getContextMenuCoordinates(mouse, matrix).y,
              isReadOnlyContextMenu: true,
            });
            path.dispatch('mouseover');
          })
          .on('mouseleave', function (d: any) {
            showContextMenuOf$.next({
              initiatives: null,
              x: 0,
              y: 0,
              isReadOnlyContextMenu: true,
            });
            path.dispatch('mouseout');
          });
      });

    simulation.nodes(graph.nodes as any).on('tick', ticked);

    simulation.force<ForceLink<any, any>>('link').links(graph.links);

    function ticked() {
      link.attr('d', positionLink);
      link.attr('d', positionArrow);
      node.attr('transform', positionNode);
      // label.attr("transform", positionLabel);
    }

    // function positionLabel(d: any) {
    //   let path = g.select("defs").select(`path[id="path${d[5]}"]`);
    //   if (path.node()) {
    //     let p = path
    //       .node()
    //       .getPointAtLength(0.6 * path.node().getTotalLength());
    //     return "translate(" + p.x + "," + p.y + ")";
    //   } else {
    //     return "translate(" + 0 + "," + 0 + ")";
    //   }
    // }

    function positionLink(d: any) {
      const source = d[0],
        target = d[2];
      // // fit path like you've been doing
      //   path.attr("d", function(d){
      const dx = target.x - source.x,
        dy = target.y - source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
      return (
        'M' +
        source.x +
        ',' +
        source.y +
        'A' +
        dr +
        ',' +
        dr +
        ' 0 0,1 ' +
        target.x +
        ',' +
        target.y
      );
    }

    function positionArrow(d: any) {
      const source = d[0],
        target = d[2],
        weight = d[3];
      // length of current path
      const pl = this.getTotalLength(),
        // radius of circle plus marker head
        r =
          CIRCLE_RADIUS * 1.5 +
          Math.sqrt(CIRCLE_RADIUS * 2 + CIRCLE_RADIUS * 2), // 16.97 is the "size" of the marker Math.sqrt(12**2 + 12 **2)
        // position close to where path intercepts circle
        m = this.getPointAtLength(pl - r);
      const dx = m.x - source.x,
        dy = m.y - source.y,
        dr = Math.sqrt(dx * dx + dy * dy);

      return (
        'M' +
        source.x +
        ',' +
        source.y +
        'A' +
        dr +
        ',' +
        dr +
        ' 0 0,1 ' +
        m.x +
        ',' +
        m.y
      );
    }

    function positionNode(d: any) {
      return 'translate(' + d.x + ',' + d.y + ')';
    }

    function dragstarted(d: any) {
      if (!d3.getEvent().active) simulation.alphaTarget(0.3).restart();
      d3.select(this).classed('fixed', (d.fixed = true));
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: any) {
      d.fx = d3.getEvent().x;
      d.fy = d3.getEvent().y;
    }

    function dragended(d: any) {
      if (!d3.getEvent().active) simulation.alphaTarget(0);
      // d.fx = null;
      // d.fy = null;
    }

    function releaseNode(d: any) {
      d3.select(this).classed('fixed', (d.fixed = false));
      d.fx = null;
      d.fy = null;
      d3.getEvent().stopPropagation();
    }
  }
}
