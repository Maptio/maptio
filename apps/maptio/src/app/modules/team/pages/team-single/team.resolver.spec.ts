import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgProgressModule, NgProgress } from '@ngx-progressbar/core';
import { IntercomModule } from '@supy-io/ngx-intercom';
import { TeamComponentResolver } from './team.resolver';
import { Auth } from '../../../../core/authentication/auth.service';
import { UserRoleService } from '../../../../shared/model/permission.data';
import { TeamFactory } from '../../../../core/http/team/team.factory';
import { DatasetFactory } from '../../../../core/http/map/dataset.factory';
import { UserFactory } from '../../../../core/http/user/user.factory';
import { AuthConfiguration } from '../../../../core/authentication/auth.config';
import { UserService } from '../../../../shared/services/user/user.service';
import { MailingService } from '../../../../shared/services/mailing/mailing.service';
import { JwtEncoder } from '../../../../shared/services/encoding/jwt.service';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { AuthHttp } from 'angular2-jwt';
import { authHttpServiceFactoryTesting } from '../../../../core/mocks/authhttp.helper.shared';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Initiative } from '../../../../shared/model/initiative.data';
import { Team } from '../../../../shared/model/team.data';
import { User } from '../../../../shared/model/user.data';
import { ActivatedRouteSnapshot } from '@angular/router';
import { AnalyticsModule } from '../../../../core/analytics.module';

describe('team.resolver.ts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AnalyticsModule,
        NgProgressModule,
        IntercomModule.forRoot({
          appId: '',
          updateOnRouterChange: true,
        }),
      ],
      providers: [
        TeamComponentResolver,
        Auth,
        UserRoleService,
        TeamFactory,
        DatasetFactory,
        UserFactory,
        AuthConfiguration,
        UserService,
        MailingService,
        JwtEncoder,
        LoaderService,
        NgProgress,
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
        // ErrorService
      ],
    });
  });

  it('resolves when all datasets and teams load', waitForAsync(
    inject(
      [TeamComponentResolver, DatasetFactory, TeamFactory],
      (
        target: TeamComponentResolver,
        datasetFactory: DatasetFactory,
        teamFactory: TeamFactory
      ) => {
        const spyGetDataSet = spyOn(datasetFactory, 'get').and.callFake(() => {
          return Promise.resolve([
            new DataSet({
              datasetId: '1',
              tags: [],
              initiative: new Initiative({ name: `One`, team_id: `team_id` }),
            }),
            new DataSet({
              datasetId: '2',
              tags: [],
              initiative: new Initiative({ name: `Two`, team_id: `team_id` }),
            }),
            new DataSet({
              datasetId: '3',
              tags: [],
              initiative: new Initiative({
                name: `Three`,
                team_id: `team_id`,
              }),
            }),
          ]);
        });

        const spyGetTeam = spyOn(teamFactory, 'get').and.callFake(() => {
          return Promise.resolve(
            new Team({
              team_id: 'team_id',
              name: `Team`,
              members: [new User({ user_id: '1' }), new User({ user_id: '2' })],
            })
          );
        });

        const snapshot = new ActivatedRouteSnapshot();
        snapshot.params = { teamid: '123' };
        target.resolve(snapshot, undefined).subscribe((data) => {
          expect(spyGetDataSet).toHaveBeenCalledWith(
            jasmine.objectContaining({ team_id: '123' })
          );
          expect(spyGetTeam).toHaveBeenCalledWith('123');

          expect(data.team.team_id).toBe('team_id');
          expect(data.team.name).toBe('Team');
          expect(data.team.members.length).toBe(2);

          expect(data.datasets.length).toBe(3);
          expect(data.datasets[0].initiative.name).toBe('One');
          expect(data.datasets[1].initiative.name).toBe('Three');
          expect(data.datasets[2].initiative.name).toBe('Two');
        });
      }
    )
  ));
});
