import { AuthHttp } from "angular2-jwt";
import { Initiative } from "./../model/initiative.data";
import { DataSet } from "./../../../app/shared/model/dataset.data";
import { TestBed, async, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, BaseRequestOptions, ResponseOptions, RequestMethod } from "@angular/http";
import { DatasetFactory } from "./dataset.factory"
import { ErrorService } from "./error/error.service";
import { User } from "../../../app/shared/model/user.data"
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { Auth } from "./auth/auth.service";

describe("dataset.factory.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                },
                { provide: Auth, useValue: undefined },
                DatasetFactory
                ,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService
            ]
        });

        spyOn(ErrorService.prototype, "handleError");

    });

    describe("get", () => {

        it("should return rejected promise", async(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            target.get(undefined)
                .catch((reason: any) => { expect(reason).toBeDefined() })
        })));


        describe("(user)", () => {
            it("should get a list of datasets when called with User", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
                const mockResponse = {
                    datasets: [
                        "1", "2", "3"  // list of datasets ObjectId matched to a given user
                    ]
                };

                mockBackend.connections.subscribe((connection: MockConnection) => {
                    if (connection.request.method === RequestMethod.Get && connection.request.url === "/api/v1/user/uniqueId/datasets") {
                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(mockResponse)
                        })));
                    }
                    else {
                        throw new Error("URL " + connection.request.url + " is not configured");
                    }
                });

                let user = new User({ user_id: "uniqueId" });

                target.get(user).then((datasets => {
                    expect(datasets.length).toBe(3);
                    expect(datasets[0]).toBe("1");
                    expect(datasets[1]).toBe("2");
                    expect(datasets[2]).toBe("3");
                    expect(mockErrorService.handleError).not.toHaveBeenCalled();
                });
            })));

            it("should return empty array when API response is invalid", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
                const mockResponse = {
                    notdatasets: [
                        "1", "2", "3"  // list of datasets ObjectId matched to a given user
                    ]
                };

                mockBackend.connections.subscribe((connection: MockConnection) => {
                    if (connection.request.method === RequestMethod.Get && connection.request.url === "/api/v1/user/uniqueId/datasets") {
                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(mockResponse)
                        })));
                    }
                    else {
                        throw new Error("URL " + connection.request.url + " is not configured");
                    }
                });

                let user = new User({ user_id: "uniqueId" });

                target.get(user).then(datasets => {
                    expect(datasets.length).toBe(0);
                    expect(mockErrorService.handleError).not.toHaveBeenCalled();
                });
            })));

        });

        describe("(id)", () => {
            it("should get a one dataset when called with <id>", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {

                const mockResponse = {
                    _id: "some unique Id",
                    name: "NAME",
                    children: new Array<any>()
                };

                mockBackend.connections.subscribe((connection: MockConnection) => {
                    if (connection.request.method === RequestMethod.Get && connection.request.url === "/api/v1/dataset/uniqueId") {
                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(mockResponse)
                        })));
                    }
                    else {
                        throw new Error("URL " + connection.request.url + " is not configured");
                    }
                });

                target.get("uniqueId").then(dataset => {
                    expect(dataset).toBeDefined();
                    expect(dataset._id).toBe("uniqueId");
                    expect(mockErrorService.handleError).not.toHaveBeenCalled();

                });
            })));

            // it("should call error service when REST API response is invalid", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            //     const mockResponse = {
            //         crazy: "value"
            //     };

            //     mockBackend.connections.subscribe((connection: MockConnection) => {
            //         if (connection.request.method === RequestMethod.Get && connection.request.url === "/api/v1/dataset/uniqueId") {
            //             connection.mockRespond(new Response(new ResponseOptions({
            //                 body: JSON.stringify(mockResponse)
            //             })));
            //         }
            //         else {
            //             throw new Error("URL " + connection.request.url + " is not configured");
            //         }
            //     });

            //     let mockDataset = jasmine.createSpyObj("DataSet", ["deserialize"]);
            //     spyOn(DataSet, "create").and.returnValue(mockDataset);
            //     mockDataset.deserialize.and.throwError();

            //     target.get("uniqueId").then(dataset => {
            //         expect(dataset).toBeUndefined();
            //         expect(mockErrorService.handleError).toHaveBeenCalled();

            //     });
            // })));
        });
    });

    describe("create", () => {
        it("should throw if parameter is undefined", async(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            expect(function () { target.create(undefined) }).toThrowError();
        })));

        it("should call REST API with post", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            let dataset = new DataSet({ _id: "some_unique_id", initiative: new Initiative({ name: "Project" }) });
            const mockResponse = {
                _id: "some_unique_id",
                name: "Project"
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Post && connection.request.url === "/api/v1/dataset") {
                    expect(<DataSet>connection.request.json()).toBe(dataset);
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            target.create(dataset).then((dataset: DataSet) => {
                expect(dataset).toBeDefined();
                expect(dataset._id).toBe("some_unique_id");
                expect(dataset.initiative.name).toBe("Project");
                expect(mockErrorService.handleError).not.toHaveBeenCalled();
            });
        })));

    })

    describe("add", () => {
        it("should throw if user is undefined", async(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            expect(function () { target.add(new DataSet(), undefined) }).toThrowError();
        })));

        it("should throw if parameter is undefined", async(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            expect(function () { target.add(undefined, new User()) }).toThrowError();
        })));

        it("should call REST API with put", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {

            const mockResponse = {
                _id: "some_unique_id",
                name: "Project"
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Put && connection.request.url === "/api/v1/user/uid/dataset/did") {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });
            let dataset = new DataSet({ _id: "did" });
            let user = new User({ user_id: "uid" })
            target.add(dataset, user).then((result: boolean) => {
                expect(result).toBe(true);
                expect(mockErrorService.handleError).not.toHaveBeenCalled();
            });
        })));

    })

    // describe("delete", () => {
    //     it("should throw if user is undefined", async(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
    //         expect(function () { target.delete(new DataSet(), undefined) }).toThrowError();
    //     })));

    //     it("should throw if parameter is undefined", async(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
    //         expect(function () { target.delete(undefined, new User()) }).toThrowError();
    //     })));

    //     it("should call REST API with delete", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {

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
    //             expect(mockErrorService.handleError).not.toHaveBeenCalled();
    //         });
    //     })));

    // })

    describe("upsert", () => {
        it("should throw if dataset is undefined", async(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            expect(function () { target.upsert(undefined, "unique_id") }).toThrowError();
        })));

        it("should call REST API with put when id is empty", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            let dataset = new DataSet({ _id: "some_unique_id", initiative: new Initiative({ name: "Project" }) });

            const mockResponse = {
                _id: "some_unique_id",
                name: "Project"
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Put && connection.request.url === "/api/v1/dataset/some_unique_id") {
                    expect(<Initiative>connection.request.json()).toBe(dataset.initiative);
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            target.upsert(dataset).then((result: boolean) => {
                expect(result).toBe(true);
                expect(mockErrorService.handleError).not.toHaveBeenCalled();
            });
        })));

        it("should call REST API with put when id is not empty", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            let dataset = new DataSet({ _id: "some_unique_id", initiative: new Initiative({ name: "Project" }) });

            const mockResponse = {
                _id: "some_unique_id",
                name: "Project"
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Put && connection.request.url === "/api/v1/dataset/some_unique_id") {
                    expect(connection.request.json()).toBe(dataset.initiative);
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            target.upsert(dataset, "some_unique_id").then((result: boolean) => {
                expect(result).toBe(true);
                expect(mockErrorService.handleError).not.toHaveBeenCalled();
            });
        })));

    })
});



