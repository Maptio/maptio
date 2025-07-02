import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { of as observableOf, Subscription, Subject } from 'rxjs';
import { debounceTime, switchMap, combineLatest } from 'rxjs/operators';

import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { DataService } from '../../../services/data.service';
import { UserFactory } from '../../../../../core/http/user/user.factory';
import { UserService } from '../../../../../shared/services/user/user.service';
import { DataSet } from '../../../../../shared/model/dataset.data';
import { Team } from '../../../../../shared/model/team.data';
import { User } from '../../../../../shared/model/user.data';
import { Permissions } from '../../../../../shared/model/permission.data';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { LoaderService } from '../../../../../shared/components/loading/loader.service';
import { PermissionsDirective } from '../../../../../shared/directives/permission.directive';
import { PersonalSummaryComponent } from './personal.component';

@Component({
    selector: 'summary-people',
    templateUrl: './people.component.html',
    styleUrls: ['./people.component.css'],
    host: { class: 'd-flex flex-row w-100' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgTemplateOutlet,
    NgbCollapseModule,
    PersonalSummaryComponent,
    PermissionsDirective
]
})
export class PeopleSummaryComponent implements OnInit {
  members: User[];
  filteredMembers: User[];
  initiative: Initiative;
  team: Team;
  dataset: DataSet;
  dataSubscription: Subscription;
  filterMembers$: Subject<string> = new Subject<string>();
  Permissions = Permissions;

  selectedMember = signal<User>(null);
  showOtherMembers = signal<boolean>(false);
  showAllMembers = computed(() => {
    return this.selectedMember() === null || this.showOtherMembers();
  });

  constructor(
    public route: ActivatedRoute,
    public userFactory: UserFactory,
    private userService: UserService,
    private dataService: DataService,
    public loaderService: LoaderService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loaderService.show();
    this.dataSubscription = this.dataService
      .get()
      .pipe(
        combineLatest(this.route.queryParams),
        switchMap((data: [any, Params]) => {
          if (data[1].member) {
            return this.userFactory.get(data[1].member).then((user: User) => {
              this.selectedMember.set(user);
              return data[0];
            });
          } else {
            this.selectedMember.set(null);
            return observableOf(data[0]);
          }
        })
      )
      .subscribe((data: any) => {
        this.members = data.members;
        this.initiative = data.initiative;
        this.dataset = data.dataset;
        this.team = data.team;
        this.loaderService.hide();
        this.filteredMembers = [].concat(this.members);
        this.cd.markForCheck();
      });

    this.filterMembers$
      .asObservable()
      .pipe(debounceTime(250))
      .subscribe((search) => {
        this.filteredMembers =
          search === ''
            ? [].concat(this.members)
            : this.members.filter(
                (m) => m.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
              );
        this.cd.markForCheck();
      });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }

  onKeyDown(search: string) {
    this.filterMembers$.next(search);
  }

  onAddingNewMember() {
    this.router.navigateByUrl(`/teams/${this.team.team_id}/people`);
  }

  onSelectMember(user: User) {
    this.selectedMember.set(user);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { member: user.shortid },
    });
  }

  toggleShowOtherMembers() {
    this.showOtherMembers.set(!this.showOtherMembers());
  }

  onSelectInitiative(initiative: Initiative) {
    localStorage.setItem('node_id', initiative.id.toString());
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
