import { UserFactory } from './../../shared/services/user.factory';
import { Observable } from 'rxjs/Rx';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { TeamFactory } from './../../shared/services/team.factory';
import { ActivatedRoute } from '@angular/router';
import { TestBed, inject, async, ComponentFixture } from "@angular/core/testing";

import { TeamComponent } from "./team.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ErrorService } from "../../shared/services/error/error.service";
import { User } from "../../shared/model/user.data";
import { Team } from "../../shared/model/team.data";

describe("team.component.ts", () => {
    let component: TeamComponent;
    let target: ComponentFixture<TeamComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeamComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(TeamComponent, {
            set: {
                providers: [TeamFactory, UserFactory,
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    MockBackend,
                    BaseRequestOptions,
                    ErrorService,
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: Observable.of({ teamid: 123 })
                        }
                    }]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamComponent);
        component = target.componentInstance;
    });

    it("should have an instance", () => {
        expect(component).toBeDefined();
    });


    describe("addMemberToTeam", () => {
        it("should update team then update user then refresh  ", async(() => {
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);

            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true));
            let spyGetTeam = spyOn(mockTeamFactory, "get").and.returnValue(Promise.resolve(new Team({ team_id: "team_id", members: [] })));
            let spyUpsertTeam = spyOn(mockTeamFactory, "upsert").and.returnValue(Promise.resolve(true));

            component.newMember = new User({ name: "John Doe", user_id: "user_id", teams: ["team1"] })
            component.teamId = "team_id";
            component.addMemberToTeam();

            spyUpsert.calls.mostRecent().returnValue.then(() => {
                expect(component.newMember.teams).toEqual(["team1", "team_id"]);
                expect(spyGetTeam).toHaveBeenCalledWith(component.teamId);

                spyGetTeam.calls.mostRecent().returnValue.then(() => {
                    expect(spyUpsertTeam).toHaveBeenCalledWith(jasmine.objectContaining({
                        team_id: "team_id",
                        members: [jasmine.objectContaining({ user_id: 'user_id' })]
                    }));

                })

            })

        }))
    })
});