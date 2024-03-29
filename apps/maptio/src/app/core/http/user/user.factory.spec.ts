import {
  TestBed,
  inject,
  fakeAsync,
  waitForAsync,
} from '@angular/core/testing';
import {
  HttpModule,
  Response,
  Http,
  BaseRequestOptions,
  ResponseOptions,
} from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { authHttpServiceFactoryTesting } from '../../mocks/authhttp.helper.shared';
import { Auth } from '../../authentication/auth.service';
import { UserFactory } from './user.factory';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { ErrorService } from '../../../shared/services/error/error.service';
import { User } from '../../../shared/model/user.data';

describe('user.factory.ts', () => {
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
        UserFactory,
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

  const mockUser = {
    deserialize: jest.fn(),
  };

  describe('getAll', () => {
    it(
      'should be rejected when no parameters',
      waitForAsync(
        inject(
          [UserFactory, MockBackend],
          (target: UserFactory, mockBackend: MockBackend) => {
            spyOn(User, 'create').and.returnValue(mockUser);
            mockUser.deserialize.mockReturnValue(
              new User({ name: 'Deserialized' })
            );

            const mockResponse = [
              {
                id: 1,
                uniqueId: 'uniqueId1',
                name: 'First',
                email: 'first@domain.com',
                picture: 'http://seemyface/user.jpg',
              },
              {
                id: 2,
                uniqueId: 'uniqueId2',
                name: 'Second',
                email: 'second@domain.com',
              },
              { id: 3, uniqueId: 'uniqueId3', name: 'Third' },
              { id: 3, uniqueId: 'uniqueId4' },
            ];

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (connection.request.url === '/api/v1/user/all') {
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

            target
              .getAll('')
              .then((users) => {})
              .catch((reason) => {
                expect(reason).toBe('You cannot make a search for all users !');
              });
          }
        )
      )
    );

    it(
      'should call correct REST API endpoint when pattern search parameter',
      waitForAsync(
        inject(
          [UserFactory, MockBackend],
          (target: UserFactory, mockBackend: MockBackend) => {
            const spyCreate = spyOn(User, 'create').and.returnValue(mockUser);
            const spyDeserialize = mockUser.deserialize.mockReturnValue(
              new User({ name: 'Deserialized' })
            );

            const mockResponse = [
              {
                id: 1,
                uniqueId: 'uniqueId1',
                name: 'First',
                email: 'first@domain.com',
                picture: 'http://seemyface/user.jpg',
              },
              {
                id: 2,
                uniqueId: 'uniqueId2',
                name: 'Second',
                email: 'second@domain.com',
              },
              { id: 3, uniqueId: 'uniqueId3', name: 'Third' },
              { id: 3, uniqueId: 'uniqueId4' },
            ];

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (connection.request.url === '/api/v1/user/all/searched') {
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

            target.getAll('searched').then((users) => {
              expect(spyCreate).toHaveBeenCalled();
              expect(spyDeserialize).toHaveBeenCalled();
              expect(users.length).toBe(4);
              users.forEach(function (element) {
                expect(element).toEqual(jasmine.any(User));
              });
            });
          }
        )
      )
    );
  });

  describe('getUsers', () => {
    it(
      'should be rejected when no parameters',
      waitForAsync(
        inject(
          [UserFactory, MockBackend],
          (target: UserFactory, mockBackend: MockBackend) => {
            spyOn(User, 'create').and.returnValue(mockUser);
            mockUser.deserialize.mockReturnValue(
              new User({ name: 'Deserialized' })
            );

            const mockResponse = [
              {
                id: 1,
                uniqueId: 'uniqueId1',
                name: 'First',
                email: 'first@domain.com',
                picture: 'http://seemyface/user.jpg',
              },
              {
                id: 2,
                uniqueId: 'uniqueId2',
                name: 'Second',
                email: 'second@domain.com',
              },
              { id: 3, uniqueId: 'uniqueId3', name: 'Third' },
              { id: 3, uniqueId: 'uniqueId4' },
            ];

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (connection.request.url === '/api/v1/user/in') {
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

            target
              .getUsers([])
              .then((users) => {})
              .catch((reason) => {
                expect(reason).toBe('You cannot make a search for all users !');
              });
          }
        )
      )
    );

    it(
      'should call correct REST API endpoint when pattern search parameter',
      waitForAsync(
        inject(
          [UserFactory, MockBackend],
          (target: UserFactory, mockBackend: MockBackend) => {
            const spyCreate = spyOn(User, 'create').and.returnValue(mockUser);
            const spyDeserialize = mockUser.deserialize.mockReturnValue(
              new User({ name: 'Deserialized' })
            );

            const mockResponse = [
              {
                id: 1,
                uniqueId: 'uniqueId1',
                name: 'First',
                email: 'first@domain.com',
                picture: 'http://seemyface/user.jpg',
              },
              {
                id: 2,
                uniqueId: 'uniqueId2',
                name: 'Second',
                email: 'second@domain.com',
              },
              { id: 3, uniqueId: 'uniqueId3', name: 'Third' },
              { id: 3, uniqueId: 'uniqueId4' },
            ];

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (connection.request.url === '/api/v1/user/in/1,2,3,4') {
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

            target.getUsers(['1', '2', '3', '4']).then((users) => {
              expect(spyCreate).toHaveBeenCalled();
              expect(spyDeserialize).toHaveBeenCalled();
              expect(users.length).toBe(4);
              users.forEach(function (element) {
                expect(element).toEqual(jasmine.any(User));
              });
            });
          }
        )
      )
    );
  });

  describe('get', () => {
    it('should call correct REST API endpoint', fakeAsync(
      inject(
        [UserFactory, MockBackend],
        (target: UserFactory, mockBackend: MockBackend) => {
          const spyCreate = spyOn(User, 'create').and.returnValue(mockUser);
          const spyDeserialize = mockUser.deserialize.mockReturnValue(
            new User({ name: 'Deserialized' })
          );

          const mockResponse = [
            {
              id: 1,
              uniqueId: 'uniqueId1',
              name: 'First',
              email: 'first@domain.com',
              picture: 'http://seemyface/user.jpg',
            },
          ];

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.url === '/api/v1/user/someId') {
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

          target.get('someId').then((user) => {
            expect(spyCreate).toHaveBeenCalled();
            expect(spyDeserialize).toHaveBeenCalled();
            expect(user).toBeDefined();
            expect(user.name).toBe('Deserialized');
          });
        }
      )
    ));
  });

  describe('create', () => {
    it('should call correct REST API endpoint', fakeAsync(
      inject(
        [UserFactory, MockBackend],
        (target: UserFactory, mockBackend: MockBackend) => {
          const spyCreate = spyOn(User, 'create').and.returnValue(mockUser);
          const spyDeserialize = mockUser.deserialize.mockReturnValue(
            new User({ name: 'Created' })
          );

          const mockResponse = [
            {
              id: 1,
              uniqueId: 'uniqueId1',
              name: 'First',
              email: 'first@domain.com',
              picture: 'http://seemyface/user.jpg',
            },
          ];

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.url === '/api/v1/user') {
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

          const user = new User({ user_id: '12', name: 'Me' });
          target.create(user).then((user) => {
            expect(spyCreate).toHaveBeenCalled();
            expect(spyDeserialize).toHaveBeenCalled();
            expect(user).toBeDefined();
            expect(user.name).toBe('Created');
          });
        }
      )
    ));
  });

  describe('update', () => {
    it('should call correct REST API endpoint', fakeAsync(
      inject(
        [UserFactory, MockBackend],
        (target: UserFactory, mockBackend: MockBackend) => {
          const mockResponse = true;

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.url === '/api/v1/user/someId') {
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

          const user = new User({ name: 'New name', user_id: 'someId' });
          target.upsert(user).then((response) => {
            expect(response).toBe(true);
          });
        }
      )
    ));
  });
});
