import { ComponentFixture, TestBed, async, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from "@angular/http";
import { DatasetFactory } from "../../../app/shared/services/dataset.factory"
import { ErrorService } from "../../../app/shared/services/error.service";
import { User } from "../../../app/shared/model/user.data"

let spyErrorService: jasmine.Spy;


describe("dataset.factory.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [

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
        it("should get a list of datasets when called with User", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            const mockResponse = {
                datasets: [
                    "1", "2", "3"  //list of datasets ObjectId matched to a given user
                ]
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.url === "/api/v1/user/uniqueId/datasets") {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse) // irrelevant here as our array is static
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let user = new User({ user_id: "uniqueId" });

            target.get(user).then(datasets => {
                expect(datasets.length).toBe(3);
                expect(datasets[0].id).toBe("1");
                expect(datasets[1].id).toBe("2");
                expect(datasets[2].id).toBe("3");
                expect(mockErrorService.handleError).not.toHaveBeenCalled();
            });
        })));

        it("should get a one dataset when called with <id>", fakeAsync(inject([DatasetFactory, MockBackend, ErrorService], (target: DatasetFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {

            const mockResponse = {
                _id: "some unique Id",
                name: "NAME",
                children: new Array<any>()
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.url === "/api/v1/dataset/uniqueId") {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse) // irrelevant here as our array is static
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            target.get("uniqueId").then(dataset => {
                expect(dataset).toBeDefined();
                expect(dataset.id).toBe("uniqueId");
                expect(mockErrorService.handleError).not.toHaveBeenCalled();

            });
        })));
    });



});



