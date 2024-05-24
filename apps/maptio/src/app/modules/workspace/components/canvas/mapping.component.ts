import { distinct, map, combineLatest, tap } from 'rxjs/operators';

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
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  Params,
  RouterLinkActive,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { compact } from 'lodash-es';
import { BehaviorSubject, ReplaySubject, Subject, Subscription } from 'rxjs';

import { Initiative } from '../../../../shared/model/initiative.data';
import { SelectableTag, Tag } from '../../../../shared/model/tag.data';
import { Team } from '../../../../shared/model/team.data';
import { DataService } from '../../services/data.service';
import { UIService } from '../../services/ui.service';
import { URIService } from '../../../../shared/services/uri/uri.service';
import { IDataVisualizer } from './mapping.interface';
import { ExportService } from '../../../../shared/services/export/export.service';
import { Intercom } from '@supy-io/ngx-intercom';
import { User } from '../../../../shared/model/user.data';
import { Permissions } from '../../../../shared/model/permission.data';
import { MappingSummaryComponent } from '../../pages/directory/summary.component';
import { MappingCirclesGradualRevealComponent } from '../../pages/circles-gradual-reveal/mapping.circles-gradual-reveal.component';
import { environment } from '../../../../config/environment';
import * as screenfull from 'screenfull';
import { DataSet } from '../../../../shared/model/dataset.data';
import {
  MapSettingsService,
  MapSettings,
} from '../../services/map-settings.service';
import { InsufficientPermissionsMessageComponent } from '../../../permissions-messages/insufficient-permissions-message.component';
import { StickyPopoverDirective } from '../../../../shared/directives/sticky.directive';
import { PermissionsDirective } from '../../../../shared/directives/permission.directive';
import { ColorPickerComponent } from '../../../../shared/components/color-picker/color-picker.component';
import { SharingComponent } from '../sharing/sharing.component';
import { FilterTagsComponent } from '../filtering/tags.component';
import { SearchComponent } from '../searching/search.component';
import { ClosableDirective } from '../../../../shared/directives/closable.directive';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { NgTemplateOutlet, NgIf } from '@angular/common';
import {
  NgbCollapseModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { MappingCirclesExpandedComponent } from '@maptio-old-workspace/pages/circles-expanded/mapping-circles-expanded.component';
import { MappingNetworkComponent } from '@maptio-old-workspace/pages/network/mapping.network.component';

@Component({
  selector: 'mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
    NgTemplateOutlet,
    NgIf,
    NgbTooltipModule,
    NgbCollapseModule,
    ContextMenuComponent,
    ClosableDirective,
    SearchComponent,
    FilterTagsComponent,
    SharingComponent,
    ColorPickerComponent,
    PermissionsDirective,
    StickyPopoverDirective,
    InsufficientPermissionsMessageComponent,
  ],
})
export class MappingComponent {
  isFirstEdit: boolean;
  DEFAULT_TEXT_COLOR: string = environment.DEFAULT_MAP_TEXT_COLOR;
  DEFAULT_MAP_COLOR: string = environment.DEFAULT_MAP_BACKGOUND_COLOR;
  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
  Permissions = Permissions;
  fullScreenLib: any = screenfull;
  isFullScreen: boolean;
  hoveredInitiatives: Initiative[];
  isNameOnly: boolean;
  selectedInitiative: Initiative;
  selectedInitiatives: Initiative[];
  selectedInitiativeX: number;
  selectedInitiativeY: number;
  isReadOnlyContextMenu: boolean;

  isPrinting: boolean;
  hasNotified: boolean;
  hasConfigurationError: boolean;

  public x: number;
  public y: number;
  public scale: number;

  public zoom$: Subject<number>;
  public isReset$: Subject<boolean>;
  public selectableTags$: Subject<Array<SelectableTag>>;

  public VIEWPORT_WIDTH: number;
  public VIEWPORT_HEIGHT: number;

  public datasetId: string;
  public initiative: Initiative;
  public flattenInitiative: Initiative[] = [];
  public team: Team;
  public dataset: DataSet;
  public slug: string;
  public tags: Array<SelectableTag>;
  public tagsFragment: string;

  public fontSize$: BehaviorSubject<number>;
  public mapColor$: BehaviorSubject<string>;
  public zoomToInitiative$: Subject<Initiative>;

  public subscription: Subscription;
  public instance: IDataVisualizer;
  public settings: MapSettings;

  public isSearchToggled = false;
  public isFiltersToggled = false;
  public isSharingToggled = false;
  public isSettingToggled = false;

  public isMapSettingsDisabled: boolean;
  public isSearchDisabled = false;
  public isFilterDisabled = false;
  public isShareDisabled: boolean;
  public isZoomDisabled: boolean;

  @Input('tags') selectableTags: Array<SelectableTag>;
  @Input('isEmptyMap') isEmptyMap: boolean;

  @Output('openDetails') openDetails = new EventEmitter<Initiative>();

  @Output('addInitiative') addInitiative = new EventEmitter<{
    node: Initiative;
    subNode: Initiative;
  }>();
  @Output('removeInitiative') removeInitiative = new EventEmitter<Initiative>();
  @Output('moveInitiative') moveInitiative = new EventEmitter<{
    node: Initiative;
    from: Initiative;
    to: Initiative;
  }>();

  @Output('openTreePanel') openTreePanel = new EventEmitter<boolean>();
  @Output('expandTree') expandTree = new EventEmitter<boolean>();
  @Output('toggleSettingsPanel')
  toggleSettingsPanel = new EventEmitter<boolean>();
  @Output('toggleEditingPanelsVisibility')
  toggleEditingPanelsVisibility = new EventEmitter<boolean>();

  constructor(
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private uriService: URIService,
    public uiService: UIService,
    private exportService: ExportService,
    private intercom: Intercom,
    private router: Router,
    private mapSettingsService: MapSettingsService
  ) {
    console.log('mapping const');
    this.zoom$ = new Subject<number>();
    this.isReset$ = new Subject<boolean>();
    this.selectableTags$ = new ReplaySubject<Array<SelectableTag>>();
    this.mapColor$ = new BehaviorSubject<string>('');
    this.zoomToInitiative$ = new Subject();
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params) => {
      if (params.reload) {
        this.changeMapColor(params.color);
      }
    });

    this.fullScreenLib.on('change', () => {
      this.isFullScreen = this.fullScreenLib.isFullscreen;

      if (document.querySelector('svg#map')) {
        document
          .querySelector('svg#map')
          .setAttribute('width', `${this.uiService.getCanvasWidth()}`);
        document
          .querySelector('svg#map')
          .setAttribute('height', `${this.uiService.getCanvasHeight()}`);
      } else {
        if (document.querySelector('#summary-canvas'))
          (
            document.querySelector('#summary-canvas') as HTMLElement
          ).style.maxHeight = this.isFullScreen
            ? null
            : `${this.uiService.getCanvasHeight() * 0.95}px`;
        this.VIEWPORT_HEIGHT = this.uiService.getCanvasHeight();
        this.VIEWPORT_WIDTH = this.uiService.getCanvasWidth();
      }
      this.cd.markForCheck();
    });
  }

  onActivate(component: IDataVisualizer) {
    this.settings = this.mapSettingsService.get(this.datasetId);

    this.VIEWPORT_HEIGHT = this.uiService.getCanvasHeight();
    this.VIEWPORT_WIDTH = this.uiService.getCanvasWidth();

    component.showToolipOf$
      .asObservable()
      .subscribe(
        (tooltip: { initiatives: Initiative[]; isNameOnly: boolean }) => {
          if (tooltip.initiatives)
            this.openDetails.emit(tooltip.initiatives[0]);
        }
      );

    component.showDetailsOf$.asObservable().subscribe((node) => {
      this.openDetails.emit(node);
    });

    component.showContextMenuOf$.asObservable().subscribe((node) => {
      this.showContextMenu(node);
    });

    const f = this.route.snapshot.fragment; //|| this.getFragment(component);
    this.x = Number.parseFloat(this.uriService.parseFragment(f).get('x'));
    this.y = Number.parseFloat(this.uriService.parseFragment(f).get('y'));
    this.scale = Number.parseFloat(
      this.uriService.parseFragment(f).get('scale')
    );

    const tagsState =
      this.uriService.parseFragment(f).has('tags') &&
      this.uriService.parseFragment(f).get('tags')
        ? this.uriService
            .parseFragment(f)
            .get('tags')
            .split(',')
            .map(
              (s: string) => new SelectableTag({ shortid: s, isSelected: true })
            )
        : [];

    component.width = this.VIEWPORT_WIDTH;
    component.height = this.VIEWPORT_HEIGHT;

    component.margin = 50;
    component.zoom$ = this.zoom$.asObservable();
    component.selectableTags$ = this.selectableTags$.asObservable();
    component.mapColor$ = this.mapColor$.asObservable();
    component.zoomInitiative$ = this.zoomToInitiative$.asObservable();
    component.translateX = this.x;
    component.translateY = this.y;
    component.scale = this.scale;
    component.tagsState = tagsState;
    this.selectableTags$.next(tagsState);

    component.isReset$ = this.isReset$.asObservable();

    if (component.constructor === MappingSummaryComponent) {
      this.isMapSettingsDisabled = true;
      this.toggleEditingPanelsVisibility.emit(false);
    } else if (component.constructor === MappingNetworkComponent) {
      this.isMapSettingsDisabled = true;
      this.toggleEditingPanelsVisibility.emit(false);
    } else if (component.constructor === MappingCirclesGradualRevealComponent) {
      this.isMapSettingsDisabled = false;
      this.isSearchDisabled = false;
      this.isFilterDisabled = true;
      this.isZoomDisabled = false;
      this.isShareDisabled = false;
      this.toggleEditingPanelsVisibility.emit(true);
    } else if (component.constructor === MappingCirclesExpandedComponent) {
      this.isMapSettingsDisabled = false;
      this.isSearchDisabled = false;
      this.isFilterDisabled = false;
      this.isZoomDisabled = false;
      this.isShareDisabled = true;
      this.toggleEditingPanelsVisibility.emit(true);
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
    console.log('mapping on inint');
    this.VIEWPORT_HEIGHT = this.uiService.getCanvasHeight();
    this.VIEWPORT_WIDTH = this.uiService.getCanvasWidth();

    this.subscription = this.route.params
      .pipe(
        tap((params: Params) => {
          if (this.datasetId !== params['mapid']) {
            this.showTooltip(null, null);
            this.showContextMenu({
              initiatives: null,
              x: 0,
              y: 0,
              isReadOnlyContextMenu: null,
            });
          }
          this.datasetId = params['mapid'];
          this.slug = params['mapslug'];
          this.settings = this.mapSettingsService.get(this.datasetId);
          this.mapColor$.next(this.settings.mapColor);

          this.cd.markForCheck();
        }),
        combineLatest(this.dataService.get()),
        map((data) => data[1]),
        combineLatest(
          this.route.fragment,
          this.route.queryParams.pipe(distinct())
        )
      ) // PEFORMACE : with latest changes
      .subscribe(([data, fragment, queryParams]) => {
        console.log('data from mapping component', data, fragment, queryParams);
        if (
          !data.initiative.children ||
          !data.initiative.children[0] ||
          !data.initiative.children[0].children
        ) {
          this.isFirstEdit = true;
          this.cd.markForCheck();
        } else {
          this.isFirstEdit = false;
          this.cd.markForCheck();
        }

        if (queryParams.id) {
          this.zoomToInitiative(new Initiative({ id: <number>queryParams.id }));
        }

        const fragmentTags =
          this.uriService.parseFragment(fragment).has('tags') &&
          this.uriService.parseFragment(fragment).get('tags')
            ? this.uriService
                .parseFragment(fragment)
                .get('tags')
                .split(',')
                .map(
                  (s: string) =>
                    new SelectableTag({ shortid: s, isSelected: true })
                )
            : <SelectableTag[]>[];

        this.tags = compact<SelectableTag>(
          data.dataset.tags.map((dataTag: SelectableTag) => {
            const searchTag = fragmentTags.find(
              (t) => t.shortid === dataTag.shortid
            );
            return new SelectableTag({
              shortid: dataTag.shortid,
              name: dataTag.name,
              color: dataTag.color,
              isSelected: searchTag !== undefined,
            });
          })
        );

        this.dataset = data.dataset;
        this.initiative = data.initiative;
        this.team = data.team;
        this.flattenInitiative = data.initiative.flatten();
        this.cd.markForCheck();
      });

    this.route.fragment.subscribe((f) => {});
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

  showContextMenu(context: {
    initiatives: Initiative[];
    x: number;
    y: number;
    isReadOnlyContextMenu: boolean;
  }) {
    this.isReadOnlyContextMenu = context.isReadOnlyContextMenu;
    this.selectedInitiatives = context.initiatives;
    this.selectedInitiativeX = context.x;
    this.selectedInitiativeY = context.y;
    this.cd.markForCheck();
  }

  showTooltip(nodes: Initiative[], isNameOnly: boolean) {
    if (nodes) this.emitOpenInitiative(nodes[0]);
    // this.hoveredInitiatives = nodes;
    // this.isNameOnly = isNameOnly;
    // this.cd.markForCheck();
  }

  onSearchToggle(event: Event) {
    this.isSearchToggled = !this.isSearchToggled;
    this.isFiltersToggled = false;
    this.isSharingToggled = false;
    this.isSettingToggled = false;
    event.stopPropagation();
  }

  onFiltersToggle(event: Event) {
    this.isSearchToggled = false;
    this.isFiltersToggled = !this.isFiltersToggled;
    this.isSharingToggled = false;
    this.isSettingToggled = false;
    event.stopPropagation();
  }

  onSharingToggle(event: Event) {
    this.isSearchToggled = false;
    this.isFiltersToggled = false;
    this.isSharingToggled = !this.isSharingToggled;
    this.isSettingToggled = false;
    event.stopPropagation();
  }

  onSettingToggle(event: Event) {
    this.isSearchToggled = false;
    this.isFiltersToggled = false;
    this.isSharingToggled = false;
    this.isSettingToggled = !this.isSettingToggled;
    event.stopPropagation();
  }

  zoomOut() {
    this.zoom$.next(1 / 3);
  }

  zoomIn() {
    this.zoom$.next(3);
  }

  resetZoom() {
    this.isReset$.next(true);
  }

  fullScreen() {
    this.fullScreenLib.toggle(document.querySelector('#mapping-canvas'));
  }

  changeMapColor(color: string) {
    this.mapColor$.next(color);
    this.settings.mapColor = color;
    this.mapSettingsService.set(this.datasetId, this.settings);
  }

  addFirstNode() {
    this.addInitiative.emit({
      node: this.initiative,
      subNode: new Initiative(),
    });
    this.openTreePanel.emit(true);
    this.expandTree.emit(true);
  }

  emitAddInitiative(context: { node: Initiative; subNode: Initiative }) {
    this.addInitiative.emit({ node: context.node, subNode: context.subNode });
  }

  emitOpenInitiative(node: Initiative) {
    this.openDetails.emit(node);
  }

  emitRemoveInitiative(node: Initiative) {
    this.removeInitiative.emit(node);
  }

  broadcastTagsSelection(tags: SelectableTag[]) {
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

  zoomToInitiative(selected: Initiative) {
    this.zoomToInitiative$.next(selected);
  }

  goToUserSummary(selected: User) {
    this.isSearchToggled = true;
    this.isSearchDisabled = true;
    this.showTooltip(null, null);
    this.cd.markForCheck();
    this.router.navigateByUrl(
      `/map/${this.datasetId}/${this.slug}/directory?member=${selected.shortid}`
    );
  }
}
