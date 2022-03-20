import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { MailingService } from '../../shared/services/mailing/mailing.service';
import { AuthConfiguration } from '../authentication/auth.config';
import { UserService } from '../../shared/services/user/user.service';
import { AuthHttp } from 'angular2-jwt';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Initiative } from '../../shared/model/initiative.data';
import { DataSet } from '../../shared/model/dataset.data';
import { TeamFactory } from '../http/team/team.factory';
import { Router } from '@angular/router';
import { EmitterService } from '../services/emitter.service';
import { UserFactory } from '../http/user/user.factory';
import { HeaderComponent } from './header.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatasetFactory } from '../http/map/dataset.factory';
import { ErrorService } from '../../shared/services/error/error.service';
import { Auth } from '../authentication/auth.service';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions, HttpModule } from '@angular/http';
import { User } from '../../shared/model/user.data';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { RouterTestingModule } from '@angular/router/testing';
import { authHttpServiceFactoryTesting } from '../mocks/authhttp.helper.shared';
import { JwtEncoder } from '../../shared/services/encoding/jwt.service';
import { LoaderService } from '../../shared/components/loading/loader.service';
import { Team } from '../../shared/model/team.data';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BillingService } from '../../shared/services/billing/billing.service';
import { NgProgress, NgProgressModule } from '@ngx-progressbar/core';
import { OnboardingService } from '../../shared/components/onboarding/onboarding.service';
import { AnalyticsModule } from '../analytics.module';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../../shared/services/auth/auth.module';
import { CoreModule } from '../core.module';

fdescribe('header.component.ts', () => {
  let component: HeaderComponent;
  let target: ComponentFixture<HeaderComponent>;
  let user$: Subject<User> = new Subject<User>();

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [
          AuthModule,
          HttpModule,
          CoreModule,
          RouterTestingModule,
          FormsModule,
          ReactiveFormsModule,
          AnalyticsModule,
          SharedModule.forRoot(),
          NgProgressModule.forRoot(),
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .overrideComponent(HeaderComponent, {
          set: {
            providers: [
              {
                provide: Auth,
                useClass: class {
                  getUser() {
                    return user$.asObservable();
                  }
                  authenticated() {
                    return;
                  }
                  login() {
                    return;
                  }
                  logout() {
                    return;
                  }
                  allAuthenticated() {
                    return;
                  }
                },
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
                provide: AuthHttp,
                useFactory: authHttpServiceFactoryTesting,
                deps: [Http, BaseRequestOptions],
              },

              // { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
              MockBackend,
              BaseRequestOptions,
            ],
          },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(HeaderComponent);
    component = target.componentInstance;
    EmitterService.get('currentMembers').emit([]);
  });

  xit(
    "should load user's datasets when all load",
    waitForAsync(() => {
      let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
      let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
      // target.debugElement.injector.get(TeamFactory);

      let spyDatasets = spyOn(mockDataSetFactory, 'get').and.callFake(
        (ids: string[]) => {
          return Promise.resolve([
            new DataSet({
              datasetId: '1',
              initiative: new Initiative({ name: `Name 1`, team_id: `team_1` }),
            }),
            new DataSet({
              datasetId: '2',
              initiative: new Initiative({ name: `Name 2`, team_id: `team_2` }),
            }),
            new DataSet({
              datasetId: '3',
              initiative: new Initiative({ name: `Name 3`, team_id: `team_3` }),
            }),
          ]);
        }
      );

      spyOn(mockTeamFactory, 'get').and.callFake((ids: string[]) => {
        return Promise.resolve([
          new Team({ team_id: 'team_1' }),
          new Team({ team_id: 'team_2' }),
          new Team({ team_id: 'team_3' }),
        ]);
      });

      component.ngOnInit();
      user$.next(
        new User({
          user_id: 'some_new_id',
          datasets: ['1', '2', '3'],
          teams: [],
        })
      );
      EmitterService.get('headerUser').emit(user$.asObservable());
      spyDatasets.calls
        .mostRecent()
        .returnValue.then(() => {})
        .then(() => {})
        .then(() => {
          let ds = component.datasets;
          expect(ds.length).toBe(3);
          ds.forEach((d, index) => {
            expect(d.datasetId).toBe(`${index + 1}`);
            expect(d.initiative.name).toBe(`Name ${index + 1}`);
            expect(d.name).toBe(`Name ${index + 1}`);
            expect(d.team_id).toBe(`team_${index + 1}`);
          });
        });
    })
  );

  xit(
    "should load user's datasets when some fail",
    waitForAsync(() => {
      // component.ngOnInit();
      let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
      let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
      target.debugElement.injector.get(TeamFactory);

      let spyDatasets = spyOn(mockDataSetFactory, 'get').and.callFake(
        (ids: string[]) => {
          return Promise.resolve([
            new DataSet({
              datasetId: '1',
              initiative: new Initiative({ name: `Name 1`, team_id: `team_1` }),
            }),
            new DataSet({
              datasetId: '3',
              initiative: new Initiative({ name: `Name 3`, team_id: `team_3` }),
            }),
          ]);
        }
      );

      spyOn(mockTeamFactory, 'get').and.callFake((ids: string[]) => {
        return Promise.resolve([
          new Team({ team_id: 'team_1' }),
          new Team({ team_id: 'team_3' }),
        ]);
      });

      component.ngOnInit();
      user$.next(
        new User({
          user_id: 'some_new_id',
          datasets: ['1', '2', '3'],
          teams: [],
        })
      );
      EmitterService.get('headerUser').emit(user$.asObservable());
      spyDatasets.calls
        .mostRecent()
        .returnValue.then(() => {})
        .then(() => {})
        .then(() => {
          let ds = component.datasets;
          expect(ds.length).toBe(2);
          expect(ds[0].datasetId).toBe('1');
          expect(ds[0].initiative.name).toBe(`Name 1`);
          expect(ds[0].name).toBe(`Name 1`);
          expect(ds[0].team_id).toBe(`team_1`);
          expect(ds[1].datasetId).toBe('3');
          expect(ds[1].initiative.name).toBe(`Name 3`);
          expect(ds[1].name).toBe(`Name 3`);
          expect(ds[1].team_id).toBe(`team_3`);
        });
    })
  );

  it('should get rid of subscription on destroy', () => {
    component.ngOnInit();
    // let spyEmitter = spyOn(component.emitterSubscription, "unsubscribe");
    let spyUser = spyOn(component.userSubscription, 'unsubscribe');
    target.destroy();
    expect(spyUser).toHaveBeenCalled();
    // expect(spyEmitter).toHaveBeenCalled();
  });

  describe('View', () => {
    // it("display selected dataset", () => {
    //     EmitterService.get("currentDataset").emit(new DataSet({ datasetId: "some_id" }));
    //     expect(component.selectedDataset.datasetId).toBe("some_id")
    // });

    describe('Authentication', () => {
      xit('should display LogIn button when no user is authenticated', () => {
        let mockAuth = target.debugElement.injector.get(Auth);
        let spyAuthService = spyOn(
          mockAuth,
          'allAuthenticated'
        ).and.returnValue(false);
        target.detectChanges();

        let imgElement = target.debugElement.queryAll(
          By.css('li#profileInformation')
        );
        expect(imgElement.length).toBe(0);

        let button = target.debugElement.queryAll(By.css('form#loginForm'));
        expect(button.length).toBe(1);
        expect(spyAuthService).toHaveBeenCalled();
      });

      it('should display LogOut button and profile information when a user is authenticated', () => {
        let mockAuth = target.debugElement.injector.get(Auth);
        let spyAuthService = spyOn(
          mockAuth,
          'allAuthenticated'
        ).and.returnValue(true);

        target.detectChanges();

        let button = target.debugElement.queryAll(By.css('a#logoutButton'));
        expect(button.length).toBe(2);
        expect(spyAuthService).toHaveBeenCalled();
      });
    });
  });
});
