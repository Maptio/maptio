import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';

import { DataService } from '../../services/data.service';
import { TeamFactory } from '../../../../core/http/team/team.factory';
import { UserFactory } from '../../../../core/http/user/user.factory';
import { DatasetFactory } from '../../../../core/http/map/dataset.factory';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Team } from '../../../../shared/model/team.data';
import { Initiative } from '../../../../shared/model/initiative.data';
import { SelectableTag, Tag } from '../../../../shared/model/tag.data';
import { LoaderService } from '../../../../shared/components/loading/loader.service';

import { IDataVisualizer } from '../../components/canvas/mapping.interface';

@Component({
    selector: 'summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css'],
    host: { class: 'w-100' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class MappingSummaryComponent implements OnInit, IDataVisualizer {
  public datasetId: string;

  public width: number;
  public height: number;
  public margin: number;

  public zoom$: Observable<number>;
  public fontSize$: Observable<number>;
  public fontColor$: Observable<string>;
  public mapColor$: Observable<string>;

  public zoomInitiative$: Subject<Initiative>;
  public selectableTags$: Observable<Array<SelectableTag>>;
  public isReset$: Observable<boolean>;

  public translateX: number;
  public translateY: number;
  public scale: number;
  public tagsState: Array<SelectableTag>;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{
    initiatives: Initiative[];
    isNameOnly: boolean;
  }> = new Subject<{ initiatives: Initiative[]; isNameOnly: boolean }>();
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

  initiative: Initiative;
  team: Team;
  dataset: DataSet;
  dataSubscription: Subscription;

  constructor(
    public route: ActivatedRoute,
    public datasetFactory: DatasetFactory,
    public userFactory: UserFactory,
    public teamFactory: TeamFactory,
    private dataService: DataService,
    public loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.show();
    this.init();

    this.dataSubscription = this.dataService.get().subscribe((data: any) => {
      this.initiative = data.initiative;
      this.dataset = data.dataset;
      this.datasetId = this.dataset.shortid;
    });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }

  init(): void {
    // throw new Error("Method not implemented.");
  }
}
