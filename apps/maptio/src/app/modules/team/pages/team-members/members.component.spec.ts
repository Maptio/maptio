import { of as observableOf, Observable } from 'rxjs';
import { SharedModule } from './../../../../shared/shared.module';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BaseRequestOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Data,
  ParamMap,
  Params,
  Route,
  UrlSegment,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthHttp } from 'angular2-jwt';
import { authHttpServiceFactoryTesting } from '../../../../core/mocks/authhttp.helper.shared';
import { Permissions } from './../../../../shared/model/permission.data';
import { Team } from './../../../../shared/model/team.data';
import { User } from './../../../../shared/model/user.data';
import { Auth } from '../../../../core/authentication/auth.service';
import { ErrorService } from './../../../../shared/services/error/error.service';
import { TeamFactory } from '../../../../core/http/team/team.factory';
import { UserFactory } from '../../../../core/http/user/user.factory';
import { UserService } from './../../../../shared/services/user/user.service';
import { TeamMembersComponent } from './members.component';
import { NgProgressModule, NgProgress } from '@ngx-progressbar/core';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { AnalyticsModule } from '../../../../core/analytics.module';
import { PermissionsModule } from '../../../../shared/permissions.module';
import { CoreModule } from '../../../../core/core.module';

class MockActivatedRoute implements ActivatedRoute {
  paramMap: Observable<ParamMap>;
  queryParamMap: Observable<ParamMap>;
  snapshot: ActivatedRouteSnapshot;
  url: Observable<UrlSegment[]>;
  params: Observable<Params>;
  queryParams: Observable<Params>;
  fragment: Observable<string>;
  data: Observable<Data> = observableOf({
    assets: {
      team: new Team({
        team_id: '123',
        name: 'team',
        settings: { authority: 'A', helper: 'H' },
        members: [new User({ user_id: '1' }), new User({ user_id: '2' })],
      }),
    },
  });
  outlet: string;
  component: Type<any> | string;
  routeConfig: Route;
  root: ActivatedRoute;
  parent: ActivatedRoute;
  firstChild: ActivatedRoute;
  children: ActivatedRoute[];
  pathFromRoot: ActivatedRoute[];
  toString(): string {
    return '';
  }
}

describe('members.component.ts', () => {
  let component: TeamMembersComponent;
  let target: ComponentFixture<TeamMembersComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeamMembersComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
          RouterTestingModule,
          CoreModule,
          SharedModule.forRoot(),
          AnalyticsModule,
          PermissionsModule,
        ],
      })
        .overrideComponent(TeamMembersComponent, {
          set: {
            providers: [
              {
                provide: LoaderService,
                useClass: class {
                  hide = jest.fn();
                  show = jest.fn();
                },
                deps: [NgProgress],
              },
              {
                provide: AuthHttp,
                useFactory: authHttpServiceFactoryTesting,
                deps: [Http, BaseRequestOptions],
              },
              {
                provide: Http,
                useFactory: (
                  mockBackend: MockBackend,
                  options: BaseRequestOptions
                ) => {
                  return new Http(mockBackend, options);
                },
                deps: [MockBackend, BaseRequestOptions],
              },
              {
                provide: Auth,
                useClass: class {
                  getUser() {
                    return observableOf(new User({ user_id: 'USER_ID' }));
                  }
                  getPermissions(): Permissions[] {
                    return [];
                  }
                },
              },
              MockBackend,
              BaseRequestOptions,
              ErrorService,
              UserService,
              {
                provide: ActivatedRoute,
                useClass: class {
                  params = observableOf({ teamid: 123, slug: 'slug' });
                  parent = new MockActivatedRoute();
                },
              },
            ],
          },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(TeamMembersComponent);
    component = target.componentInstance;
    target.detectChanges();
  });

  describe('getAllMembers', () => {
    it(
      'should retrieve members information ',
      waitForAsync(() => {
        component.team = new Team({
          team_id: 'ID',
          name: 'My team',
          members: [
            new User({ user_id: '1' }),
            new User({ user_id: '2' }),
            new User({ user_id: '3' }),
          ],
        });

        jest
          .spyOn(target.debugElement.injector.get(UserFactory), 'getUsers')
          .mockImplementation((ids: string[]) => {
            return Promise.resolve(component.team.members);
          });

        jest
          .spyOn(target.debugElement.injector.get(UserService), 'getUsersInfo')
          .mockImplementation((users: User[]) => {
            return Promise.resolve(users);
          });

        jest
          .spyOn(
            target.debugElement.injector.get(UserService),
            'isInvitationSent'
          )
          .mockRejectedValue(Promise.resolve(true));
        jest
          .spyOn(
            target.debugElement.injector.get(UserService),
            'isActivationPendingByUserId'
          )
          .mockReturnValue(Promise.resolve(true));

        component.getAllMembers().then((members: User[]) => {
          expect(members.length).toBe(3);
          expect(members.every((m) => m.isDeleted === false)).toBe(true);
        });
      })
    );

    it(
      'should retrieve members information when user retrieval fails',
      waitForAsync(() => {
        component.team = new Team({
          team_id: 'ID',
          name: 'My team',
          members: [
            new User({ user_id: '1' }),
            new User({ user_id: '2' }),
            new User({ user_id: '3' }),
          ],
        });

        jest
          .spyOn(target.debugElement.injector.get(UserFactory), 'getUsers')
          .mockImplementation((ids: string[]) => {
            return Promise.resolve(component.team.members.slice(0, 2));
          });

        jest
          .spyOn(target.debugElement.injector.get(UserService), 'getUsersInfo')
          .mockImplementation((users: User[]) => {
            return Promise.resolve(users);
          });

        component.getAllMembers().then((members: User[]) => {
          expect(members.length).toBe(2);

          // expect(members.every(m => m.isInvitationSent === true)).toBe(true)
          // expect(members.every(m => m.isActivationPending === true)).toBe(true)
          expect(members.every((m) => m.isDeleted === false)).toBe(true);
        });
      })
    );

    xit(
      'should retrieve members information when invitation status fails ',
      waitForAsync(() => {
        component.team = new Team({
          team_id: 'ID',
          name: 'My team',
          members: [
            new User({ user_id: '1' }),
            new User({ user_id: '2' }),
            new User({ user_id: '3' }),
          ],
        });

        spyOn(
          target.debugElement.injector.get(UserService),
          'getUsersInfo'
        ).and.returnValue((users: User[]) => {
          return Promise.resolve(
            users.map((u) => {
              u.isInvitationSent = false;
              return u;
            })
          );
        });

        component.getAllMembers().then((members: User[]) => {
          expect(members.length).toBe(3);
          expect(members.every((m) => m.isInvitationSent === false)).toBe(true);
          expect(members.every((m) => m.isActivationPending === true)).toBe(
            true
          );
          expect(members.every((m) => m.isDeleted === true)).toBe(true);
        });
      })
    );

    xit(
      'should retrieve members information when activation pending status fails ',
      waitForAsync(() => {
        component.team = new Team({
          team_id: 'ID',
          name: 'My team',
          members: [
            new User({ user_id: '1' }),
            new User({ user_id: '2' }),
            new User({ user_id: '3' }),
          ],
        });

        spyOn(
          target.debugElement.injector.get(UserService),
          'getUsersInfo'
        ).and.returnValue((users: User[]) => {
          return Promise.resolve(
            users.map((u) => {
              u.isActivationPending = false;
              return u;
            })
          );
        });

        component.getAllMembers().then((members: User[]) => {
          expect(members.length).toBe(3);
          expect(members.every((m) => m.isInvitationSent === true)).toBe(true);
          expect(members.every((m) => m.isActivationPending === false)).toBe(
            true
          );
          expect(members.every((m) => m.isDeleted === true)).toBe(true);
        });
      })
    );
  });

  describe('delete', () => {
    it(
      'should remote user,  update team and refresh page when there is more than one member left',
      waitForAsync(() => {
        component.team = new Team({
          team_id: 'ID',
          name: 'My team',
          members: [
            new User({ user_id: '1' }),
            new User({ user_id: '2' }),
            new User({ user_id: '3' }),
          ],
        });
        let user = new User({ user_id: '2' });

        let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
        let spyUpsert = spyOn(mockTeamFactory, 'upsert').and.returnValue(
          Promise.resolve(true)
        );
        spyOn(component, 'getAllMembers');
        component.deleteMember(user);
        expect(component.team.members.length).toBe(2);
        expect(mockTeamFactory.upsert).toHaveBeenCalledWith(component.team);
        spyUpsert.calls.mostRecent().returnValue.then(() => {
          expect(component.getAllMembers).toHaveBeenCalled();
        });
      })
    );

    it(
      'should not remove member when there is  only one member left',
      waitForAsync(() => {
        component.team = new Team({
          team_id: 'ID',
          name: 'My team',
          members: [new User({ user_id: '1' })],
        });
        let user = new User({ user_id: '1' });

        let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
        let spyUpsert = spyOn(mockTeamFactory, 'upsert').and.returnValue(
          Promise.resolve(true)
        );
        spyOn(component, 'getAllMembers');
        component.deleteMember(user);
        expect(component.team.members.length).toBe(1);
        expect(mockTeamFactory.upsert).not.toHaveBeenCalledWith(component.team);
      })
    );
  });

  xdescribe('createUser', () => {
    it('should do nothing if the form is invalid', () => {
      component.inviteForm.setValue({
        firstname: '',
        lastname: '',
      });
      spyOn(component, 'createUserFullDetails');

      component.createUser('one@company.com');
      expect(component.createUserFullDetails).not.toHaveBeenCalled();
    });

    it('should call the correct dependencies if the form is valid', () => {
      component.inviteForm.setValue({
        firstname: 'one',
        lastname: 'Last',
      });
      component.inviteForm.markAsDirty();
      let spy = spyOn(component, 'createUserFullDetails').and.returnValue(
        Promise.resolve(true)
      );
      spyOn(component, 'getAllMembers');
      component.createUser('one@company.com');

      expect(component.createUserFullDetails).toHaveBeenCalledWith(
        'one@company.com',
        'one',
        'Last'
      );
      spy.calls.mostRecent().returnValue.then(() => {
        expect(component.getAllMembers).toHaveBeenCalledTimes(1);
      });
    });
  });
});
