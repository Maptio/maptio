import { AuthHttp } from "angular2-jwt";
import { Team } from "./../model/team.data";
import { TeamFactory } from "./team.factory";
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, BaseRequestOptions, ResponseOptions, RequestMethod } from "@angular/http";
import { ErrorService } from "./error/error.service";
import { User } from "../model/user.data";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { Auth } from "./auth/auth.service";

describe("team.factory.ts", () => {

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

    });


    describe("get", () => {
        it("should call correct REST API endpoint", fakeAsync(inject([TeamFactory, MockBackend], (target: TeamFactory, mockBackend: MockBackend) => {
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

    describe("create", () => {
        it("should call correct REST API endpoint", fakeAsync(inject([TeamFactory, MockBackend], (target: TeamFactory, mockBackend: MockBackend) => {
            let mockTeam = jasmine.createSpyObj("Team", ["deserialize"]);
            let spyCreate = spyOn(Team, "create").and.returnValue(mockTeam);
            let spyDeserialize = mockTeam.deserialize.and.returnValue(new Team({ name: "Deserialized" }));

            const mockResponse = [
                { id: 1, team_id: "uniqueId1", name: "First" }
            ];

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.url === "/api/v1/team" && connection.request.method === RequestMethod.Post) {
                    expect(connection.request.json()).toEqual({
                        team_id: "id",
                        name: "New",
                        shortid: jasmine.anything(),
                        members: [
                            { user_id: "1", name: undefined, picture: undefined, nickname: undefined },
                            { user_id: "2", name: "Two", picture: undefined, nickname: undefined },
                            { user_id: "3", name: undefined, picture: "Three", nickname: undefined },
                            { user_id: "4", name: undefined, picture: undefined, nickname: "Four" }]
                    });
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error(connection.request.url + " is not setup.");
                }
            });

            let members = [new User({ user_id: "1" }), new User({ user_id: "2", name: "Two" }), new User({ user_id: "3", picture: "Three" }), new User({ user_id: "4", nickname: "Four" })]
            let team = new Team({ name: "New", team_id: "id", members: members })
            target.create(team).then(team => {
                expect(spyDeserialize).toHaveBeenCalledWith(mockResponse)
                expect(team.name).toBe("Deserialized");
            });
        })));
    });

    describe("upsert", () => {
        it("should call correct REST API endpoint", fakeAsync(inject([TeamFactory, MockBackend], (target: TeamFactory, mockBackend: MockBackend) => {
            let mockTeam = jasmine.createSpyObj("Team", ["deserialize"]);
            let spyCreate = spyOn(Team, "create").and.returnValue(mockTeam);
            let spyDeserialize = mockTeam.deserialize.and.returnValue(new Team({ name: "Deserialized" }));

            const mockResponse = [
                { id: 1, team_id: "uniqueId1", name: "First" }
            ];

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.url === "/api/v1/team/id" && connection.request.method === RequestMethod.Put) {
                    expect(connection.request.json()).toEqual({
                        team_id: "id",
                        name: "New",
                        members: [
                            { user_id: "1", name: undefined, picture: undefined, nickname: undefined },
                            { user_id: "2", name: "Two", picture: undefined, nickname: undefined },
                            { user_id: "3", name: undefined, picture: "Three", nickname: undefined },
                            { user_id: "4", name: undefined, picture: undefined, nickname: "Four" }]
                    });
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error(connection.request.url + " is not setup.");
                }
            });

            let members = [new User({ user_id: "1" }), new User({ user_id: "2", name: "Two" }), new User({ user_id: "3", picture: "Three" }), new User({ user_id: "4", nickname: "Four" })]
            let team = new Team({ name: "New", team_id: "id", members: members })
            target.upsert(team).then(result => {
                expect(result).toBe(true)
            });
        })));
    });

});



