import { URIService } from "../../../../shared/services/uri/uri.service";
import { DataService } from "../../services/data.service";
import { Browsers, UIService } from "../../services/ui.service";
import { ColorService } from "../../services/color.service";
import { PermissionsService } from "../../../../shared/services/permissions/permissions.service";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableUser, User } from "../../../../shared/model/user.data";
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
import { partition, cloneDeep, intersectionBy, isEmpty, compact, orderBy, sortBy } from "lodash-es";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { Team } from "../../../../shared/model/team.data";
import * as screenfull from 'screenfull';

import { transition } from "d3-transition";
import { select, selectAll, event, mouse } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { scaleLog, ScaleLogarithmic } from "d3-scale";
import { HierarchyCircularNode, pack, hierarchy, HierarchyNode } from "d3-hierarchy";
import { min, thresholdFreedmanDiaconis } from "d3-array";
import { color } from "d3-color";
import { AuthHttp } from "angular2-jwt";
import { map, tap, distinctUntilChanged, flatMap, combineLatest, merge } from "rxjs/operators";
import { DataSet } from "../../../../shared/model/dataset.data";
import { of, concat, forkJoin } from "rxjs";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import { environment } from "../../../../config/environment";
import { join } from "bluebird";

import { hydrate } from "./hydrate-map";

export const d3 = Object.assign(
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
  public datasetId: string;
  public width: number;
  public height: number;
  public translateX: number;
  public translateY: number;
  public scale: number;
  public containerHeight: SafeStyle;

  public margin: number;
  public zoom$: Observable<number>;
  public selectableTags$: Subject<Array<Tag>>;
  public selectableUsers$: Subject<Array<User>>;
  public isReset$: Observable<boolean>;
  public mapColor$: Subject<string>;
  public zoomInitiative$: Subject<Initiative>;

  public showToolipOf$: Subject<{ initiatives: Initiative[], user: User }> = new Subject<{ initiatives: Initiative[], user: User }>();
  public showContextMenuOf$: Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean, canDelete: boolean }> = new Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean, canDelete: boolean }>();
  public toggleDetailsPanel$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isNoMatchingCircles$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private zoomInitiativeSubscription: Subscription;
  private manualZoomSubscription: Subscription;
  private dataSubscription: Subscription;
  private resetSubscription: Subscription;

  private zooming: any;

  public analytics: Angulartics2Mixpanel;

  public isWaitingForDestinationNode: boolean = false;
  public isTooltipDescriptionVisible: boolean = false;
  public isFirstEditing: boolean = false;
  public isLocked: boolean;
  public isLoading: boolean;

  public selectedNode: Initiative;
  public selectedNodeParent: Initiative;
  public hoveredNode: Initiative;

  public initiative: Initiative;
  public team: Team;
  public user: User;
  public dataset: DataSet;
  public flattenNodes: Initiative[];
  public members: User[];
  public tags: SelectableTag[];
  public isNoMatchingCircles: boolean;
  public mission: string;

  // private _currentColor: string;
  // private _currentTags: SelectableTag[];
  // private _currentUsers: SelectableUser[]


  private _lastZoomedCircle: any;
  // private _filteringUser: User;
  public isShowMission: boolean;

  TRANSITION_DURATION = 500;

  constructor(
    public uiService: UIService,
    public router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private loaderService: LoaderService,
    private http: AuthHttp,
    private sanitizer: DomSanitizer,
    private element: ElementRef,
    private permissionsService: PermissionsService
  ) {




  }


  public get lastZoomedCircle(): string {
    return this._lastZoomedCircle;
  }


  public set lastZoomCircle(v: any) {
    this._lastZoomedCircle = v;
  }

  public setIsShowMission(v: boolean) {
    this.isShowMission = v;
    this.cd.markForCheck();
  }


  ngOnInit() {
    this.loaderService.show();
    this.dataSubscription = this.dataService
      .get()
      .pipe(
        tap((data) => {
          this.isLoading = true;
          this.isNoMatchingCircles$.next(false);
          this.analytics.eventTrack("Map", {
            action: "viewing",
            view: "initiatives",
            team: (<Team>data.team).name,
            teamId: (<Team>data.team).team_id
          });
          if (this.dataset && this.dataset.datasetId && this.dataset.datasetId !== data.dataset.datasetId) {
            this.clean();
          }
          this.cd.markForCheck();
        }),
        map(data => {
          this.initiative = data.initiative.children[0];
          this.mission = this.initiative.name;

          this.team = data.team;
          this.dataset = data.dataset;
          this.members = orderBy(data.members, m => m.name, "asc");
          this.tags = orderBy(
            data.dataset.tags.map((t: Tag) => { (<SelectableTag>t).isSelected = false; return t }),
            t => t.name.length,
            "desc");
          this.user = data.user;
          this.cd.markForCheck();
          return data.dataset;
        }),
        combineLatest(
          this.mapColor$.defaultIfEmpty(environment.DEFAULT_MAP_BACKGOUND_COLOR).distinctUntilChanged(),
          this.selectableTags$.asObservable().distinctUntilChanged(),
          this.selectableUsers$.asObservable().distinctUntilChanged()
        ),
        merge(),
        // distinctUntilChanged((pre: [DataSet, string, SelectableTag[], SelectableUser[]], cur: [DataSet, string, SelectableTag[], SelectableUser[]]) => {

        //   return pre[0].datasetId === cur[0].datasetId
        //     && pre[1] === cur[1]
        //     && sortBy(pre[2], t => t.shortid).map(t => t.shortid).join() === sortBy(cur[2], t => t.shortid).map(t => t.shortid).join()
        //     && sortBy(pre[3], u => u.user_id).map(t => t.shortid).join() === sortBy(cur[3], u => u.user_id).map(t => t.shortid).join()
        // }),
        flatMap((data: [DataSet, string, SelectableTag[], SelectableUser[]]) => {
          let filtered = this.filterByTags(data[0].initiative.children[0], data[2], data[3]);
          if (!filtered) {
            this.isNoMatchingCircles$.next(true)
          } else {
            this.isNoMatchingCircles$.next(false)
            this.clean();
            return this.draw(filtered, data[1], this.height, this.width)
          }
        }),
        tap((result: { svg: string, root: any, nodes: any }) => {

          this.containerHeight = this.uiService.getCanvasMargin();
          // wait till SVG is rendered before hydrating
          document.querySelector(".map-container").innerHTML = result.svg;

        })
      )
      .subscribe((result: { svg: string, root: any, nodes: any }) => {

        this.hydrate(result.root, result.nodes);
        this.flattenNodes = result.nodes.map((d: any) => d.data);
        this.loaderService.hide();
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
  }

  clean() {
    if (document.querySelector(".map-container")) {
      document.querySelector(".map-container").innerHTML = "";
    }
  }

  draw(data: Initiative, color: string, diameter: number, width: number) {
    const pack = d3
      .pack()
      .size([this.height - this.margin, this.height - this.margin])
      .padding(20);

    let root = d3.hierarchy(data)
      .sum(function (d) {
        return (d.accountable ? 1 : 0) + (d.helpers ? d.helpers.length : 0) + 1;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      })
    let nodes = pack(root).descendants();

    return this.http.post("/api/v1/charts/make", {
      initiative: data,
      color: color,
      width: width,
      diameter: diameter
    }).pipe(
      map(responseData => {
        return {
          svg: responseData.text(),
          root: root,
          nodes: nodes
        }
      })
    )
  }


  filterByTags(initiative: Initiative, tags: Tag[], users: User[]): Initiative {

    if (isEmpty(tags) && isEmpty(users)) return initiative;

    let clone = cloneDeep(initiative);
    const isMatchingTags = (node: Initiative): boolean => {


      let isMatchTags = isEmpty(tags)
        ? true
        : (isEmpty(node.tags))
          ? false
          : intersectionBy(tags, node.tags, t => t.shortid).length > 0;

      let isMatchUser = isEmpty(users)
        ? true
        : intersectionBy(users, node.getAllParticipants(), u => u.shortid).length > 0;



      return isMatchTags && isMatchUser;
    }


    /*
      Observe that the task has a recursive structure: applying it to any branch of a tree does to the branch the same thing that you want to do to the entire tree
      A branch could be either pruned, or removed entirely
      Your recursive implementation would return a pruned branch; it would signal branch removal by returning null
      The recursive function would check the incoming Node
      If the node represents a leaf, its content would be checked against the list of items that we wish to keep
      If a leaf is not on the "keep list", return null; otherwise return the leaf
      For non-leaf branches call the recursive method, and examine its result
      If the result is null, remove the corresponding branch from the map; otherwise, replace the branch with the pruned branch returned from the call
      If upon examining all branches the map of child nodes is empty, return null
    */
    function isAliveBranch(node: Initiative): Initiative {
      if (isEmpty(compact(node.children))) {
        // node is a leaf
        if (!isMatchingTags(node)) {
          // node to be removed
          return null;
        } else {
          return node;
        }
      }
      else {
        // node is a branch
        node.children.forEach((child, index) => {
          let result = isAliveBranch(child);
          if (!result) {
            delete node.children[index];
          }
          else {
            node.children.splice(index, 1, result);
          }
        });
        if (isEmpty(compact(node.children))) {

          if (isMatchingTags(node)) {
            node.children = [];
            return node;

          } else {

            return null;
          }

        }
        node.children = compact(node.children);
        return node;
      }
    }

    let result = isAliveBranch(clone);

    return result;

  }

  init() {

  }

  hydrate(root: any, nodes: any[]) {
    hydrate(root, nodes, this);
  }

  ngOnDestroy() {
    if (this.zoomInitiativeSubscription) {
      this.zoomInitiativeSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.resetSubscription) {
      this.resetSubscription.unsubscribe();
    }
    if (this.manualZoomSubscription) {
      this.manualZoomSubscription.unsubscribe();
    }
  }


}
