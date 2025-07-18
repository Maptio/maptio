import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { LowerCasePipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { sortBy } from 'lodash-es';
import { MarkdownModule } from 'ngx-markdown';

import { Initiative } from '@maptio-shared/model/initiative.data';
import { User } from '@maptio-shared/model/user.data';
import { Team } from '@maptio-shared/model/team.data';
import { DataSet } from '@maptio-shared/model/dataset.data';

import { MapSettingsService } from '../../../services/map-settings.service';
import { PersonalCardComponent } from '../tab/card.component';

@Component({
    selector: 'summary-personal',
    templateUrl: './personal.component.html',
    styleUrls: ['./personal.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgbNavModule,
    MarkdownModule,
    LowerCasePipe,
    TitleCasePipe,
    PersonalCardComponent
]
})
export class PersonalSummaryComponent implements OnInit {
  authorities: Array<Initiative> = [];
  helps: Array<Initiative> = [];
  public isLoading: boolean;
  authoritiesHideme: Array<boolean> = [];
  helpingHideme: Array<boolean> = [];
  initiativesMap: Map<number, boolean> = new Map<number, boolean>();
  columnNumber: number;

  @Input('member') public member: User;
  @Input('initiative') public initiative: Initiative;
  @Input('team') public team: Team;
  @Input('height') public height: number;
  @Input('dataset') public dataset: DataSet;
  @Output() edit: EventEmitter<Initiative> = new EventEmitter<Initiative>();
  @Output() selectMember: EventEmitter<User> = new EventEmitter<User>();
  @Output()
  selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();

  private _user: User;
  private _initiative: Initiative;
  private _team: Team;
  public _dataset: DataSet;

  authorityName: string;
  helperName: string;

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private mapSettingsService: MapSettingsService
  ) {}

  ngOnInit() {
    if (this._user && this._initiative && this._team && this._dataset) {
      this.getSummary();
      this.authorityName = this._team.settings.authority;
      this.helperName = this._team.settings.helper;
      this.cd.markForCheck();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.member && changes.member.currentValue) {
      this._user = changes.member.currentValue;
    }
    if (changes.initiative && changes.initiative.currentValue) {
      this._initiative = changes.initiative.currentValue;
    }
    if (changes.team && changes.team.currentValue) {
      this._team = changes.team.currentValue;
    }
    if (changes.dataset && changes.dataset.currentValue) {
      this._dataset = changes.dataset.currentValue;
      this.columnNumber =
        (localStorage.getItem(`map_settings_${this._dataset.datasetId}`)
          ? JSON.parse(
              localStorage.getItem(`map_settings_${this._dataset.datasetId}`)
            ).directoryColumnsNumber
          : 1) || 1;
      this.cd.markForCheck();
    }
    this.ngOnInit();
  }

  getSummary() {
    const authorities: Initiative[] = [];
    const helps: Initiative[] = [];

    this._initiative.traverse(
      function (i: Initiative) {
        if (i.accountable && i.accountable.user_id === this._user.user_id) {
          if (!authorities.includes(i)) authorities.push(i);
        }
        if (i.helpers && this.isHelperButNotAccountable(i)) {
          if (!helps.includes(i)) helps.push(i);
        }
      }.bind(this)
    );

    this.authorities = sortBy(authorities, (i) => i.name);
    this.helps = sortBy(helps, (i) => i.name);
  }

  /**
   * Check if the current user is a helper in an initiative
   *
   * Make an exception for those cases when a user is a helper, but is also
   * the user accountable for the initiative. In that case we need to return
   * false.
   *
   * @param initiative    the initiative to perform check on
   */
  isHelperButNotAccountable(initiative: Initiative): boolean {
    const matchingHelpers = initiative.helpers.find((helper) => {
      if (
        initiative.accountable &&
        initiative.accountable.user_id === helper.user_id
      ) {
        return false;
      } else {
        return helper.user_id === this._user.user_id;
      }
    });

    return matchingHelpers ? true : false;
  }

  toggleAuthorityView(i: number) {
    this.authoritiesHideme.forEach((el) => {
      el = true;
    });
    this.authoritiesHideme[i] = !this.authoritiesHideme[i];
  }

  toggleHelpingView(i: number) {
    this.helpingHideme.forEach((el) => {
      el = true;
    });
    this.helpingHideme[i] = !this.helpingHideme[i];
  }

  ngOnDestroy() {}

  onSelectMember(user: User) {
    this.selectMember.emit(user);
  }

  onSelectInitiative(initiative: Initiative) {
    this.selectInitiative.emit(initiative);
  }

  isColumnToggleActive(columns: number) {
    return this.columnNumber == columns;
  }

  setColumnNumber(columns: number) {
    this.columnNumber = columns;
    const settings = this.mapSettingsService.get(this._dataset.datasetId);
    settings.directoryColumnsNumber = columns;
    this.mapSettingsService.set(this._dataset.datasetId, settings);

    this.cd.markForCheck();
  }
}
