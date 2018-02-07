import { Initiative } from "./../../shared/model/initiative.data";
// import { MappingNetworkComponent } from "./network/mapping.network.component";
import { Angulartics2Mixpanel } from "angulartics2";

import { ActivatedRoute } from "@angular/router";
import {
  Component,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ComponentFactory,
  Output,
  Input,
  SimpleChanges
} from "@angular/core";

import { DataService, URIService } from "../../shared/services/data.service";
import { IDataVisualizer } from "./mapping.interface";
import { MappingCirclesComponent } from "./circles/mapping.circles.component";
import { MappingTreeComponent } from "./tree/mapping.tree.component";

import "rxjs/add/operator/map";
import {
  Subject,
  BehaviorSubject,
  Subscription,
  ReplaySubject,
  Observable
} from "rxjs/Rx";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { MemberSummaryComponent } from "./member-summary/member-summary.component";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import * as _ from "lodash";
import { MappingZoomableComponent } from "./zoomable/mapping.zoomable.component";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
// import { User, SelectableUser } from "../../shared/model/user.data";

@Component({
  selector: "mapping",
  templateUrl: "./mapping.component.html",
  styleUrls: ["./mapping.component.css"],
  entryComponents: [
    MappingCirclesComponent,
    MappingTreeComponent,
    MappingNetworkComponent,
    MemberSummaryComponent,
    MappingZoomableComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingComponent {
  PLACEMENT: string = "left";
  TOGGLE: string = "tooltip";
  TOOLTIP_PEOPLE_VIEW: string = "People view";
  TOOLTIP_INITIATIVES_VIEW: string = "Initiatives view";
  TOOLTIP_ZOOM_IN: string = "Zoom in";
  TOOLTIP_ZOOM_OUT: string = "Zoom out";
  TOOLTIP_ZOOM_FIT: string = "Zoom fit";

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

  public isCollapsed: boolean = true;
  public isSettingsPanelCollapsed: boolean = true;
  public isTagSettingActive: boolean;
  public isMapSettingActive: boolean;

  public zoom$: Subject<number>;
  public isReset$: Subject<boolean>;
  public selectableTags$: Subject<Array<SelectableTag>>;
  // public selectableUsers$: Subject<Array<SelectableUser>>;

  private VIEWPORT_WIDTH: number = 1522;
  private VIEWPORT_HEIGHT: number = 1522;

  public isLoading: boolean;
  public datasetId: string;
  public datasetName: string;
  public initiative: Initiative;
  public flattenInitiative: Initiative[] = [];
  public teamName: string;
  public teamId: string;
  public slug: string;
  public tags: Array<SelectableTag>;
  public tagsFragment: string;
  // public members: Array<SelectableUser>;
  // public usersFragment: string;

  public fontSize$: BehaviorSubject<number>;
  public zoomToInitiative$: Subject<Initiative>;
  // public isLocked$: BehaviorSubject<boolean>;
  public closeEditingPanel$: BehaviorSubject<boolean>;
  public data$: Subject<{ initiative: Initiative; datasetId: string }>;

  @Input("tags") selectableTags: Array<SelectableTag>;
  @Output("showDetails") showDetails = new EventEmitter<Initiative>();
  @Output("addInitiative") addInitiative = new EventEmitter<Initiative>();
  @Output("removeInitiative") removeInitiative = new EventEmitter<Initiative>();
  @Output("moveInitiative")
  moveInitiative = new EventEmitter<{
    node: Initiative;
    from: Initiative;
    to: Initiative;
  }>();
  @Output("closeEditingPanel") closeEditingPanel = new EventEmitter<boolean>();
  @Output("toggleSettingsPanel")
  toggleSettingsPanel = new EventEmitter<boolean>();
  @Output("applySettings")
  applySettings = new EventEmitter<{ initiative: Initiative; tags: Tag[] }>();
  // @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

  @ViewChild("drawing") public element: ElementRef;

  public componentFactory: ComponentFactory<IDataVisualizer>;
  public layout: string;
  public subscription: Subscription;
  public instance: IDataVisualizer;
  public newTagForm: FormGroup;
  newTagColor = "#fff";

  isFiltersToggled: boolean = true;

  constructor(
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private analytics: Angulartics2Mixpanel,
    private uriService: URIService
  ) {
    this.zoom$ = new Subject<number>();
    this.isReset$ = new Subject<boolean>();
    this.selectableTags$ = new ReplaySubject<Array<SelectableTag>>();
    // this.selectableUsers$ = new ReplaySubject<Array<SelectableUser>>();
    this.fontSize$ = new BehaviorSubject<number>(16);
    this.zoomToInitiative$ = new Subject();
    // this.isLocked$ = new BehaviorSubject<boolean>(this.isLocked);
    this.closeEditingPanel$ = new BehaviorSubject<boolean>(false);
    this.data$ = new Subject<{ initiative: Initiative; datasetId: string }>();

    this.newTagForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
      color: new FormControl(this.newTagColor, [Validators.required])
    });
  }

  ngAfterViewInit() {}

  onActivate(component: IDataVisualizer) {
    component.showDetailsOf$.asObservable().subscribe(node => {
      console.log("show details ", node);
      this.showDetails.emit(node);
    });
    component.addInitiative$.asObservable().subscribe(node => {
      this.addInitiative.emit(node);
    });
    component.removeInitiative$.asObservable().subscribe(node => {
      this.removeInitiative.emit(node);
    });
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
    // let membersState = this.uriService.parseFragment(f).has("users") && this.uriService.parseFragment(f).get("users")
    //     ? this.uriService.parseFragment(f).get("users")
    //         .split(",")
    //         .map((s: string) => new SelectableUser({ shortid: s, isSelected: true }))
    //     : [];

    this.layout = this.getLayout(component);

    component.width = this.VIEWPORT_WIDTH;
    component.height = this.VIEWPORT_HEIGHT;

    component.margin = 50;
    component.zoom$ = this.zoom$.asObservable();
    component.selectableTags$ = this.selectableTags$.asObservable();
    // component.selectableUsers$ = this.selectableUsers$.asObservable();
    component.fontSize$ = this.fontSize$.asObservable();
    component.zoomInitiative$ = this.zoomToInitiative$.asObservable();
    // component.isLocked$ = this.isLocked$.asObservable();
    component.translateX = this.x;
    component.translateY = this.y;
    component.scale = this.scale;
    component.tagsState = tagsState;
    this.selectableTags$.next(tagsState);
    // this.selectableUsers$.next(membersState)

    component.analytics = this.analytics;
    component.isReset$ = this.isReset$.asObservable();
    if (component.constructor === MemberSummaryComponent) {
      component.closeEditingPanel$.next(true);
    }
  }

  onDeactivate(component: any) {}

  ngOnInit() {
    this.subscription = this.route.params
      .do(params => {
        this.datasetId = params["mapid"];
        this.slug = params["mapslug"];
        this.cd.markForCheck();
      })
      .combineLatest(this.dataService.get())
      .map(data => data[1])
      .combineLatest(this.route.fragment) // PEFORMACE : with latest changes
      .subscribe(([data, fragment]) => {
        // if (!data.initiative.children || !data.initiative.children[0] || !data.initiative.children[0].children) {
        //     this.lock(false);
        //     this.cd.markForCheck();
        // }

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
        // let fragmentUsers = this.uriService.parseFragment(fragment).has("users") && this.uriService.parseFragment(fragment).get("users")
        //     ? this.uriService.parseFragment(fragment).get("users")
        //         .split(",")
        //         .map((s: string) => new SelectableUser({ shortid: s, isSelected: true }))
        //     : <SelectableUser[]>[];

        this.tags = _.compact<SelectableTag>(
          data.tags.map((dataTag: SelectableTag) => {
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

        // this.members = _.compact<SelectableUser>(data.members.map((dataUser: SelectableUser) => {
        //     let searchUser = fragmentUsers.find(t => t.shortid === dataUser.shortid);
        //     return new SelectableUser({ shortid: dataUser.shortid, name: dataUser.name, picture: dataUser.picture, isSelected: searchUser !== undefined })

        // }));
        this.datasetName = data.initiative.name;
        this.initiative = data.initiative;
        this.flattenInitiative = data.initiative.flatten();
        this.cd.markForCheck();
      });

    this.route.fragment.subscribe(f => {});
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  getFragment(component: IDataVisualizer) {
    switch (component.constructor) {
      case MappingCirclesComponent:
        return `x=${this.VIEWPORT_WIDTH / 2}&y=${this.VIEWPORT_HEIGHT /
          2}&scale=1`;
      case MappingTreeComponent:
        return `x=100&y=${this.VIEWPORT_HEIGHT / 4}&scale=1`;
      case MappingNetworkComponent:
        return `x=0&y=${-this.VIEWPORT_HEIGHT / 4}&scale=1`;
      case MemberSummaryComponent:
        return `x=0&y=0&scale=1`;
      default:
        return `x=${this.VIEWPORT_WIDTH / 2}&y=${this.VIEWPORT_HEIGHT /
          2}&scale=1`;
    }
  }

  getLayout(component: IDataVisualizer) {
    switch (component.constructor) {
      case MappingCirclesComponent:
        return `initiatives`;
      case MappingTreeComponent:
        return `people`;
      case MappingNetworkComponent:
        return `connections`;
      case MemberSummaryComponent:
        return `list`;
      default:
        return `initiatives`;
    }
  }

  zoomOut() {
    this.zoom$.next(0.9);
    this.analytics.eventTrack("Map", {
      action: "zoom out",
      mode: "button",
      team: this.teamName,
      teamId: this.teamId
    });
  }

  zoomIn() {
    this.zoom$.next(1.1);
    this.analytics.eventTrack("Map", {
      action: "zoom in",
      mode: "button",
      team: this.teamName,
      teamId: this.teamId
    });
  }

  resetZoom() {
    this.isReset$.next(true);
    this.analytics.eventTrack("Map", {
      action: "reset zoom",
      mode: "button",
      team: this.teamName,
      teamId: this.teamId
    });
  }

  // lock(locking: boolean) {
  //     this.isLocked = locking;
  //     this.isLocked$.next(this.isLocked);
  //     this.analytics.eventTrack("Map", { action: (locking ? "lock" : "unlock"), team: this.teamName, teamId: this.teamId });
  // }

  isDisplayLockingToggle() {
    return (
      this.layout !== "people" &&
      this.layout !== "connections" &&
      this.layout !== "list"
    );
  }

  changeFontSize(size: number) {
    this.fontSize$.next(size);
    this.analytics.eventTrack("Map", {
      action: "change font size",
      size: size,
      team: this.teamName,
      teamId: this.teamId
    });
  }

  toggleTag(tag: SelectableTag) {
    tag.isSelected = !tag.isSelected;
    this.selectableTags$.next(this.tags);

    let tagsHash = this.tags
      .filter(t => t.isSelected === true)
      .map(t => t.shortid)
      .join(",");
    this.tagsFragment = `tags=${tagsHash}`;

    let ancient = this.uriService.parseFragment(this.route.snapshot.fragment);
    ancient.set("tags", tagsHash);
    location.hash = this.uriService.buildFragment(ancient);
  }

  // toggleUser(user: SelectableUser) {
  //     user.isSelected = !user.isSelected;
  //     this.selectableUsers$.next(this.members);

  //     let userssHash = this.members.filter(m => m.isSelected).map(m => m.shortid).join(",");
  //     this.usersFragment = `users=${userssHash}`;

  //     let ancient = this.uriService.parseFragment(this.route.snapshot.fragment);
  //     ancient.set("users", userssHash);
  //     location.hash = this.uriService.buildFragment(ancient);
  // }

  // toggleAllTags(isAll: boolean) {
  //     this.tags.forEach(t => t.isSelected = isAll);
  //     this.selectableTags$.next(this.tags);

  //     let tagsHash = this.tags.map(t => `${t.shortid}:${t.isSelected ? 1 : 0}`).join(",");
  //     this.usersFragment = `tags=${tagsHash}`;

  //     let ancient = this.uriService.parseFragment(this.route.snapshot.fragment);
  //     ancient.set("tags", tagsHash);
  //     location.hash = this.uriService.buildFragment(ancient);
  // }

  // getTagsFragment(layout: string) {
  //     console.log(layout, this.usersFragment)
  //     return this.usersFragment;
  // }

  saveColor(tag: Tag, color: string) {
    tag.color = color;
    this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
  }

  saveTagName(tag: Tag, name: string) {
    tag.name = name;
    // this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
  }

  saveTagChanges() {
    this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
  }

  addTag() {
    if (this.newTagForm.dirty && this.newTagForm.valid) {
      let name = this.newTagForm.controls["name"].value;
      let tag = new Tag().create(name, this.newTagColor);

      this.tags.unshift(<SelectableTag>tag);
      this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
      this.newTagForm.reset();
      this.analytics.eventTrack("Map", {
        action: "Add tag",
        team: this.teamName,
        teamId: this.teamId
      });
    }
  }

  removeTag(tag: Tag) {
    let index = this.tags.findIndex(t => t.shortid === tag.shortid);
    if (index > 0) {
      this.tags.splice(index, 1);
      this.analytics.eventTrack("Map", {
        action: "Remove tag",
        team: this.teamName,
        teamId: this.teamId
      });
    }
    this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
  }

  toggleTagSettingsTab() {
    this.isSettingsPanelCollapsed = false;
    this.isTagSettingActive = true;
    this.isMapSettingActive = false;
  }

  togglePanel() {
    this.isSettingsPanelCollapsed = false;
    this.isMapSettingActive = true;
    this.isTagSettingActive = false;
  }

  public searchResultsCount: number;
  public isSearching: boolean;
  searchInitiatives = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .do((term: string) => {
        this.isSearching = true && term !== "";
        this.cd.markForCheck();
      })
      .map(term => {
        return term === ""
          ? this.flattenInitiative
          : this.flattenInitiative.filter(
              v =>
                v.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                // (v.description &&
                //   v.description.toLowerCase().indexOf(term.toLowerCase()) >
                //     -1) ||
                (v.accountable &&
                  v.accountable.name.toLowerCase().indexOf(term.toLowerCase()) >
                    -1) ||
                (v.helpers &&
                  v.helpers
                    .map(h => h.name)
                    .join("")
                    .toLowerCase()
                    .indexOf(term.toLowerCase()) > -1)
            );
      })
      .do(list => {
        this.searchResultsCount = list.length;
        this.cd.markForCheck();
      });

  formatter = (result: Initiative) => {
    return result.name;
  };

  zoomToInitiative(event: NgbTypeaheadSelectItemEvent) {
    let initiative = event.item;
    this.isSearching = false;
    this.cd.markForCheck();
    this.zoomToInitiative$.next(initiative);
  }
}
