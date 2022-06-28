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
  RequestMethod,
  ResponseOptions,
} from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { authHttpServiceFactoryTesting } from '../../mocks/authhttp.helper.shared';
import { Auth } from '../../authentication/auth.service';
import { DatasetFactory } from './dataset.factory';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { ErrorService } from '../../../shared/services/error/error.service';
import { User } from '../../../shared/model/user.data';
import { Team } from '../../../shared/model/team.data';
import { DataSet } from '../../../shared/model/dataset.data';
import { Initiative } from '../../../shared/model/initiative.data';

describe('dataset.factory.ts', () => {
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
        DatasetFactory,
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

  describe('get', () => {
    it(
      'should return rejected promise',
      waitForAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            target.get(undefined).catch((reason: any) => {
              expect(reason).toBeDefined();
            });
          }
        )
      )
    );

    describe('(user)', () => {
      it('should get a list of datasets when called with User', fakeAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            const mockResponse = [{ _id: '1' }, { _id: '2' }, { _id: '3' }];

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (
                connection.request.method === RequestMethod.Get &&
                connection.request.url === '/api/v1/user/uniqueId/datasets'
              ) {
                connection.mockRespond(
                  new Response(
                    new ResponseOptions({
                      body: mockResponse,
                    })
                  )
                );
              } else {
                throw new Error(
                  'URL ' + connection.request.url + ' is not configured'
                );
              }
            });

            let user = new User({ user_id: 'uniqueId' });

            target.get(user).then((datasets) => {
              expect(datasets.length).toBe(3);
              expect(datasets[0]).toBe('1');
              expect(datasets[1]).toBe('2');
              expect(datasets[2]).toBe('3');
            });
          }
        )
      ));

      it('should return empty array when API response is invalid', fakeAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (
                connection.request.method === RequestMethod.Get &&
                connection.request.url === '/api/v1/user/uniqueId/datasets'
              ) {
                connection.mockRespond(
                  new Response(
                    new ResponseOptions({
                      body: '',
                    })
                  )
                );
              } else {
                throw new Error(
                  'URL ' + connection.request.url + ' is not configured'
                );
              }
            });

            let user = new User({ user_id: 'uniqueId' });

            target.get(user).then((datasets) => {
              expect(datasets.length).toBe(0);
            });
          }
        )
      ));
    });

    describe('(team)', () => {
      it('should get a list of datasets when called with Team', fakeAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            const mockResponse = [{ _id: '1' }, { _id: '2' }, { _id: '3' }];

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (
                connection.request.method === RequestMethod.Get &&
                connection.request.url === '/api/v1/team/teamId/datasets'
              ) {
                connection.mockRespond(
                  new Response(
                    new ResponseOptions({
                      body: mockResponse,
                    })
                  )
                );
              } else {
                throw new Error(
                  'URL ' + connection.request.url + ' is not configured'
                );
              }
            });

            let team = new Team({ team_id: 'teamId' });

            target.get(team).then((datasets) => {
              expect(datasets.length).toBe(3);
              expect(datasets[0].datasetId).toBe('1');
              expect(datasets[1].datasetId).toBe('2');
              expect(datasets[2].datasetId).toBe('3');
            });
          }
        )
      ));

      it('should return empty array when API response is invalid', fakeAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (
                connection.request.method === RequestMethod.Get &&
                connection.request.url === '/api/v1/user/uniqueId/datasets'
              ) {
                connection.mockRespond(
                  new Response(
                    new ResponseOptions({
                      body: '',
                    })
                  )
                );
              } else {
                throw new Error(
                  'URL ' + connection.request.url + ' is not configured'
                );
              }
            });

            let user = new User({ user_id: 'uniqueId' });

            target.get(user).then((datasets) => {
              expect(datasets.length).toBe(0);
            });
          }
        )
      ));
    });

    describe('(id)', () => {
      it('should get a one dataset when called with <id>', fakeAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            const mockResponse = {
              _id: 'some unique Id',
              name: 'NAME',
              children: new Array<any>(),
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (
                connection.request.method === RequestMethod.Get &&
                connection.request.url === '/api/v1/dataset/uniqueId'
              ) {
                connection.mockRespond(
                  new Response(
                    new ResponseOptions({
                      body: JSON.stringify(mockResponse),
                    })
                  )
                );
              } else {
                throw new Error(
                  'URL ' + connection.request.url + ' is not configured'
                );
              }
            });

            target.get('uniqueId').then((dataset) => {
              expect(dataset).toBeDefined();
              expect(dataset.datasetId).toBe('uniqueId');
            });
          }
        )
      ));
    });

    describe('(ids)', () => {
      it('should get many datasets when called with <ids>', fakeAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            const mockResponse = [{ _id: '1' }, { _id: '2' }, { _id: '3' }];

            mockBackend.connections.subscribe((connection: MockConnection) => {
              if (
                connection.request.method === RequestMethod.Get &&
                connection.request.url === '/api/v1/dataset/in/1,2,3'
              ) {
                connection.mockRespond(
                  new Response(
                    new ResponseOptions({
                      body: JSON.stringify(mockResponse),
                    })
                  )
                );
              } else {
                throw new Error(
                  'URL ' + connection.request.url + ' is not configured'
                );
              }
            });

            target.get(['1', '2', '3']).then((datasets) => {
              expect(datasets.length).toBe(3);
            });
          }
        )
      ));
    });
  });

  describe('create', () => {
    it(
      'should throw if parameter is undefined',
      waitForAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            expect(function () {
              target.create(undefined);
            }).toThrowError();
          }
        )
      )
    );

    it('should call REST API with post', fakeAsync(
      inject(
        [DatasetFactory, MockBackend],
        (target: DatasetFactory, mockBackend: MockBackend) => {
          let dataset = new DataSet({
            datasetId: 'some_unique_id',
            initiative: new Initiative({ name: 'Project' }),
          });
          const mockResponse = {
            _id: 'some_unique_id',
            name: 'Project',
          };

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (
              connection.request.method === RequestMethod.Post &&
              connection.request.url === '/api/v1/dataset'
            ) {
              expect(<DataSet>connection.request.json()).toBe(dataset);
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(
                'URL ' + connection.request.url + ' is not configured'
              );
            }
          });

          target.create(dataset).then((dataset: DataSet) => {
            expect(dataset).toBeDefined();
            expect(dataset.datasetId).toBe('some_unique_id');
            expect(dataset.initiative.name).toBe('Project');
          });
        }
      )
    ));
  });

  describe('add', () => {
    it(
      'should throw if user is undefined',
      waitForAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            expect(function () {
              target.add(new DataSet(), undefined);
            }).toThrowError();
          }
        )
      )
    );

    it(
      'should throw if parameter is undefined',
      waitForAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            expect(function () {
              target.add(undefined, new User());
            }).toThrowError();
          }
        )
      )
    );

    it('should call REST API with put', fakeAsync(
      inject(
        [DatasetFactory, MockBackend],
        (target: DatasetFactory, mockBackend: MockBackend) => {
          const mockResponse = {
            _id: 'some_unique_id',
            name: 'Project',
          };

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (
              connection.request.method === RequestMethod.Put &&
              connection.request.url === '/api/v1/user/uid/dataset/did'
            ) {
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(
                'URL ' + connection.request.url + ' is not configured'
              );
            }
          });
          let dataset = new DataSet({ datasetId: 'did' });
          let user = new User({ user_id: 'uid' });
          target.add(dataset, user).then((result: boolean) => {
            expect(result).toBe(true);
          });
        }
      )
    ));
  });

  // describe("delete", () => {
  //     it("should throw if user is undefined", async(inject([DatasetFactory, MockBackend], (target: DatasetFactory, mockBackend: MockBackend) => {
  //         expect(function () { target.delete(new DataSet(), undefined) }).toThrowError();
  //     })));

  //     it("should throw if parameter is undefined", async(inject([DatasetFactory, MockBackend], (target: DatasetFactory, mockBackend: MockBackend) => {
  //         expect(function () { target.delete(undefined, new User()) }).toThrowError();
  //     })));

  //     it("should call REST API with delete", fakeAsync(inject([DatasetFactory, MockBackend], (target: DatasetFactory, mockBackend: MockBackend) => {

  //         const mockResponse = {
  //             _id: "some_unique_id",
  //             name: "Project"
  //         };

  //         mockBackend.connections.subscribe((connection: MockConnection) => {
  //             if (connection.request.method === RequestMethod.Delete && connection.request.url === "/api/v1/user/uid/dataset/did") {
  //                 connection.mockRespond(new Response(new ResponseOptions({
  //                     body: JSON.stringify(mockResponse)
  //                 })));
  //             }
  //             else {
  //                 throw new Error("URL " + connection.request.url + " is not configured");
  //             }
  //         });
  //         let dataset = new DataSet({ _id: "did" });
  //         let user = new User({ user_id: "uid" })
  //         target.delete(dataset, user).then((result: boolean) => {
  //             expect(result).toBe(true);
  //         });
  //     })));

  // })

  describe('upsert', () => {
    it(
      'should throw if dataset is undefined',
      waitForAsync(
        inject(
          [DatasetFactory, MockBackend],
          (target: DatasetFactory, mockBackend: MockBackend) => {
            expect(function () {
              target.upsert(undefined, 'unique_id');
            }).toThrowError();
          }
        )
      )
    );

    it('should call REST API with put when id is empty', fakeAsync(
      inject(
        [DatasetFactory, MockBackend],
        (target: DatasetFactory, mockBackend: MockBackend) => {
          let dataset = new DataSet({
            datasetId: 'some_unique_id',
            initiative: new Initiative({ name: 'Project' }),
          });

          const mockResponse = {
            _id: 'some_unique_id',
            name: 'Project',
          };

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (
              connection.request.method === RequestMethod.Put &&
              connection.request.url === '/api/v1/dataset/some_unique_id'
            ) {
              expect(<DataSet>connection.request.json()).toBe(dataset);
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(
                'URL ' + connection.request.url + ' is not configured'
              );
            }
          });

          target.upsert(dataset).then((result: boolean) => {
            expect(result).toBe(true);
          });
        }
      )
    ));

    it('should call REST API with put when id is not empty', fakeAsync(
      inject(
        [DatasetFactory, MockBackend],
        (target: DatasetFactory, mockBackend: MockBackend) => {
          let dataset = new DataSet({
            datasetId: 'some_unique_id',
            initiative: new Initiative({ name: 'Project' }),
          });

          const mockResponse = {
            _id: 'some_unique_id',
            name: 'Project',
          };

          mockBackend.connections.subscribe((connection: MockConnection) => {
            if (
              connection.request.method === RequestMethod.Put &&
              connection.request.url === '/api/v1/dataset/some_unique_id'
            ) {
              expect(connection.request.json()).toBe(dataset);
              connection.mockRespond(
                new Response(
                  new ResponseOptions({
                    body: JSON.stringify(mockResponse),
                  })
                )
              );
            } else {
              throw new Error(
                'URL ' + connection.request.url + ' is not configured'
              );
            }
          });

          target.upsert(dataset, 'some_unique_id').then((result: boolean) => {
            expect(result).toBe(true);
          });
        }
      )
    ));
  });
});
