import { TestBed, fakeAsync, inject } from '@angular/core/testing';
import {
  HttpModule,
  Http,
  Response,
  BaseRequestOptions,
  ResponseOptions,
  RequestMethod,
} from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { authHttpServiceFactoryTesting } from '../../mocks/authhttp.helper.shared';
import { Auth } from '../../authentication/auth.service';
import { TeamFactory } from './team.factory';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { ErrorService } from '../../../shared/services/error/error.service';

import { SlackIntegration } from '../../../shared/model/integrations.data';
import { User } from '../../../shared/model/user.data';

import { Team } from '../../../shared/model/team.data';

describe('team.factory.ts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        {
          provide: AuthHttp,
          useFactory: authHttpServiceFactoryTesting,
          deps: [Http, BaseRequestOptions],
        },
        { provide: Auth, useValue: undefined },
        TeamFactory,
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
        ErrorService,
      ],
    });
  });

  const mockTeam = {
    deserialize: jest.fn(),
  };

  describe('get', () => {
    it('(id) should call correct REST API endpoint', fakeAsync(
      inject(
        [TeamFactory, MockBackend],
        (target: TeamFactory, mockBackend: MockBackend) => {
          const spyCreate = spyOn(Team, 'create').and.returnValue(mockTeam);
          const spyDeserialize = mockTeam.deserialize.mockReturnValue(
            new Team({ name: 'Deserialized' })
          );

          const mockResponse = [{ id: 1, team_id: 'uniqueId1', name: 'First' }];

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.url === '/api/v1/team/someId') {
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(connection.request.url + ' is not setup.');
            }
          });

          target.get('someId').then((team) => {
            expect(spyCreate).toHaveBeenCalled();
            expect(spyDeserialize).toHaveBeenCalled();
            expect(team).toBeDefined();
            expect(team.name).toBe('Deserialized');
          });
        }
      )
    ));

    it('(ids) should call correct REST API endpoint', fakeAsync(
      inject(
        [TeamFactory, MockBackend],
        (target: TeamFactory, mockBackend: MockBackend) => {
          const mockResponse = [{ _id: '1' }, { _id: '2' }, { _id: '3' }];
          mockTeam.deserialize.mockImplementation(
            (input) => new Team({ team_id: input._id, name: 'Deserialized' })
          );

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.url === '/api/v1/team/in/1,2,3') {
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(connection.request.url + ' is not setup.');
            }
          });

          target.get(['1', '2', '3']).then((teams) => {
            expect(teams.length).toBe(3);
            expect(teams[0].team_id).toBe('1');
            expect(teams[1].team_id).toBe('2');
            expect(teams[2].team_id).toBe('3');
          });
        }
      )
    ));
  });

  describe('create', () => {
    it('should call correct REST API endpoint', fakeAsync(
      inject(
        [TeamFactory, MockBackend],
        (target: TeamFactory, mockBackend: MockBackend) => {
          spyOn(Team, 'create').and.returnValue(mockTeam);
          const spyDeserialize = mockTeam.deserialize.mockReturnValue(
            new Team({ name: 'Deserialized' })
          );

          const mockResponse = [{ id: 1, team_id: 'uniqueId1', name: 'First' }];

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (
              connection.request.url === '/api/v1/team' &&
              connection.request.method === RequestMethod.Post
            ) {
              expect(connection.request.json()).toEqual({
                team_id: 'id',
                name: 'New',
                shortid: jasmine.anything(),
                slack: new SlackIntegration({ access_token: 'token' }),
                isTemporary: false,
                isExample: false,
                members: [
                  {
                    user_id: '1',
                    name: undefined,
                    picture: undefined,
                    nickname: undefined,
                  },
                  {
                    user_id: '2',
                    name: 'Two',
                    picture: undefined,
                    nickname: undefined,
                  },
                  {
                    user_id: '3',
                    name: undefined,
                    picture: 'Three',
                    nickname: undefined,
                  },
                  {
                    user_id: '4',
                    name: undefined,
                    picture: undefined,
                    nickname: 'Four',
                  },
                ],
              });
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(connection.request.url + ' is not setup.');
            }
          });

          const members = [
            new User({ user_id: '1' }),
            new User({ user_id: '2', name: 'Two' }),
            new User({ user_id: '3', picture: 'Three' }),
            new User({ user_id: '4', nickname: 'Four' }),
          ];
          const team = new Team({
            name: 'New',
            team_id: 'id',
            members: members,
            isTemporary: false,
            isExample: false,
            slack: new SlackIntegration({
              access_token: 'token',
            }),
          });
          target.create(team).then((team) => {
            expect(spyDeserialize).toHaveBeenCalledWith(mockResponse);
            expect(team.name).toBe('Deserialized');
          });
        }
      )
    ));
  });

  describe('upsert', () => {
    it('should call correct REST API endpoint', fakeAsync(
      inject(
        [TeamFactory, MockBackend],
        (target: TeamFactory, mockBackend: MockBackend) => {
          spyOn(Team, 'create').and.returnValue(mockTeam);
          mockTeam.deserialize.mockReturnValue(
            new Team({ name: 'Deserialized' })
          );

          const mockResponse = [{ id: 1, team_id: 'uniqueId1', name: 'First' }];

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (
              connection.request.url === '/api/v1/team/id' &&
              connection.request.method === RequestMethod.Put
            ) {
              expect(connection.request.json()).toEqual({
                team_id: 'id',
                name: 'New',
                settings: { authority: 'Driver', helper: 'Backseat' },
                slack: new SlackIntegration({ access_token: 'token' }),
                isTemporary: false,
                isExample: false,
                members: [
                  {
                    user_id: '1',
                    name: undefined,
                    picture: undefined,
                    nickname: undefined,
                  },
                  {
                    user_id: '2',
                    name: 'Two',
                    picture: undefined,
                    nickname: undefined,
                  },
                  {
                    user_id: '3',
                    name: undefined,
                    picture: 'Three',
                    nickname: undefined,
                  },
                  {
                    user_id: '4',
                    name: undefined,
                    picture: undefined,
                    nickname: 'Four',
                  },
                ],
              });
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(connection.request.url + ' is not setup.');
            }
          });

          const members = [
            new User({ user_id: '1' }),
            new User({ user_id: '2', name: 'Two' }),
            new User({ user_id: '3', picture: 'Three' }),
            new User({ user_id: '4', nickname: 'Four' }),
          ];
          const team = new Team({
            name: 'New',
            team_id: 'id',
            members: members,
            settings: { authority: 'Driver', helper: 'Backseat' },
            slack: new SlackIntegration({
              access_token: 'token',
            }),
            isTemporary: false,
            isExample: false,
          });
          target.upsert(team).then((result) => {
            expect(result).toBe(true);
          });
        }
      )
    ));
  });
});
