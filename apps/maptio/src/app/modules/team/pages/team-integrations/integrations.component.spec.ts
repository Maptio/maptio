import { of as observableOf, Observable } from 'rxjs';
import { SlackIntegration } from './../../../../shared/model/integrations.data';
import { TeamIntegrationsComponent } from './integrations.component';
import { Initiative } from './../../../../shared/model/initiative.data';
import { DataSet } from './../../../../shared/model/dataset.data';
import { SharedModule } from './../../../../shared/shared.module';
import { Permissions } from './../../../../shared/model/permission.data';
import { Auth } from '../../../../core/authentication/auth.service';
import {
  ActivatedRouteSnapshot,
  ActivatedRoute,
  UrlSegment,
  ParamMap,
  Params,
  Data,
  Route,
} from '@angular/router';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TeamFactory } from '../../../../core/http/team/team.factory';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Team } from '../../../../shared/model/team.data';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { authHttpServiceFactoryTesting } from '../../../../core/mocks/authhttp.helper.shared';
import { Http, BaseRequestOptions, Response } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { User } from '../../../../shared/model/user.data';
import { IntercomModule } from 'ng-intercom';
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
      datasets: [
        new DataSet({
          datasetId: '1',
          initiative: new Initiative({ name: 'One' }),
        }),
        new DataSet({
          datasetId: '2',
          initiative: new Initiative({ name: 'Two' }),
        }),
        new DataSet({
          datasetId: '3',
          initiative: new Initiative({ name: 'Three' }),
        }),
      ],
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

describe('integrations.component.ts', () => {
  let component: TeamIntegrationsComponent;
  let target: ComponentFixture<TeamIntegrationsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeamIntegrationsComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
          RouterTestingModule,
          CoreModule,
          SharedModule.forRoot(),
          AnalyticsModule,
          PermissionsModule,
        ],
      })
        .overrideComponent(TeamIntegrationsComponent, {
          set: {
            providers: [
              TeamFactory,
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
              MockBackend,
              BaseRequestOptions,
              {
                provide: ActivatedRoute,
                useClass: class {
                  params = observableOf({ teamid: 123, slug: 'slug' });
                  queryParams = observableOf({ code: 'code' });
                  parent = new MockActivatedRoute();
                },
              },
              // Angulartics2Mixpanel, Angulartics2
            ],
          },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(TeamIntegrationsComponent);

    component = target.componentInstance;
    target.detectChanges();
  });

  describe('revoke token', () => {
    it(
      'calls the right dependencies',
      waitForAsync(() => {
        component.team = new Team({
          team_id: 'id',
          name: 'Team',
          slack: new SlackIntegration({ access_token: 'TOKEN' }),
          members: [],
          settings: { authority: 'A', helper: 'H' },
        });
        let spyHttpGet = spyOn(
          target.debugElement.injector.get(Http),
          'get'
        ).and.returnValue(
          observableOf(
            new Response({
              body: {},
              status: 200,
              headers: null,
              url: '',
              merge: null,
            })
          )
        );

        let spyTeamFactory = spyOn(
          target.debugElement.injector.get(TeamFactory),
          'upsert'
        ).and.returnValue(
          Promise.resolve(
            new Team({ team_id: 'id', slack: new SlackIntegration({}) })
          )
        );

        component.revokeToken('TOKEN');
        expect(target.debugElement.injector.get(Http).get).toHaveBeenCalledWith(
          'https://slack.com/api/auth.revoke?token=TOKEN'
        );
        expect(spyTeamFactory).toHaveBeenCalledWith(
          jasmine.objectContaining({
            team_id: 'id',
            name: 'Team',
            slack: new SlackIntegration({}),
            settings: { authority: 'A', helper: 'H' },
            members: [],
          })
        );
        spyTeamFactory.calls.mostRecent().returnValue.then(() => {
          expect(component.team.team_id).toBe('id');
          expect(component.team.name).toBe('Team');
          expect(component.team.slack.access_token).toBeUndefined();

          expect(component.isDisplayRevokedToken).toBe(true);
          expect(component.isDisplayWaitingForSlackSync).toBe(false);
        });
      })
    );
  });

  describe('update Team', () => {
    it('calls the right dependencies', () => {
      component.team = new Team({
        team_id: 'id',
        name: 'Team',
        slack: new SlackIntegration({ access_token: 'TOKEN' }),
        members: [],
        settings: { authority: 'A', helper: 'H' },
      });

      spyOn(
        target.debugElement.injector.get(TeamFactory),
        'upsert'
      ).and.returnValue(Promise.resolve(true));

      component.updateTeam(
        'TOKEN',
        {
          url: 'app_url',
          channel: 'channel',
          channel_id: 'channelId',
          configuration_url: 'configuration_url',
        },
        'workspace',
        'workspaceId'
      );

      expect(
        target.debugElement.injector.get(TeamFactory).upsert
      ).toHaveBeenCalledWith(
        jasmine.objectContaining({
          team_id: 'id',
          name: 'Team',
          slack: new SlackIntegration({
            access_token: 'TOKEN',
            team_name: 'workspace',
            team_id: 'workspaceId',
            incoming_webhook: {
              url: 'app_url',
              channel: 'channel',
              channel_id: 'channelId',
              configuration_url: 'configuration_url',
            },
          }),
          settings: { authority: 'A', helper: 'H' },
          members: [],
        })
      );
    });
  });
});
