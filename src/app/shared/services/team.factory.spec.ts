import { Team } from "./../model/team.data";
import { TeamFactory } from "./team.factory";
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, BaseRequestOptions, ResponseOptions } from "@angular/http";
import { ErrorService } from "./error/error.service";

describe("team.factory.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [

                TeamFactory
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
        it("should call correct REST API endpoint", fakeAsync(inject([TeamFactory, MockBackend, ErrorService], (target: TeamFactory, mockBackend: MockBackend, mockErrorService: ErrorService) => {
            let mockTeam = jasmine.createSpyObj("Team", ["deserialize"]);
            let spyCreate = spyOn(Team, "create").and.returnValue(mockTeam);
            let spyDeserialize = mockTeam.deserialize.and.returnValue(new Team({ name: "Deserialized" }));

            const mockResponse = [
                { id: 1, team_id: "uniqueId1", name: "First" }
            ];

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.url === "/api/v1/team/someId") {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error(connection.request.url + " is not setup.");
                }
            });

            target.get("someId").then(team => {
                expect(spyCreate).toHaveBeenCalled()
                expect(spyDeserialize).toHaveBeenCalled();
                expect(team).toBeDefined();
                expect(team.name).toBe("Deserialized");
            });
        })));
    });

});



