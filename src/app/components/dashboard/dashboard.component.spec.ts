import { Initiative } from "./../../shared/model/initiative.data";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions, Http } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { TeamFactory } from "./../../shared/services/team.factory";
import { DatasetFactory } from "./../../shared/services/dataset.factory";

import { DashboardComponent } from "./dashboard.component";
import { ErrorService } from "./../../shared/services/error/error.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Subject } from "rxjs/Rx";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { DataSet } from "../../shared/model/dataset.data";
import { Team } from "../../shared/model/team.data";

describe("dashboard.component.ts", () => {

    let component: DashboardComponent;
    let target: ComponentFixture<DashboardComponent>;
    let user$: Subject<User> = new Subject<User>();
    let AuthStub;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [DashboardComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(DashboardComponent, {
            set: {
                providers: [
                    DatasetFactory, TeamFactory,
                    { provide: Auth, useClass: class { getUser() { return user$.asObservable() } } },
                    {
                        provide: AuthHttp,
                        useFactory: authHttpServiceFactoryTesting,
                        deps: [Http, BaseRequestOptions]
                    },
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
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(DashboardComponent);

        component = target.componentInstance;

        // target.detectChanges();
    });

    it("should load user's datasets when all load", async(() => {
        let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
        let mockTeamFactory = target.debugElement.injector.get(TeamFactory);

        let spyGetDataSet = spyOn(mockDataSetFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new DataSet({ _id: id, initiative: new Initiative({ name: `Name ${id}`, team_id: `team_${id}` }) }))
        })
        let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new Team({ team_id: id, name: `Team ${id}` }))

        })

        user$.next(new User({ user_id: "some_new_id", datasets: ["1", "2", "3"] }));

        component.datasets$.then(ds => {
            expect(ds.length).toBe(3);
            ds.forEach((d, index) => {
                expect(d._id).toBe(`${index + 1}`);
                expect(d.initiative.name).toBe(`Name ${index + 1}`);
                expect(d.team.name).toBe(`Team team_${index + 1}`);
            })
        })

    }));

    it("should load user's datasets when one doesnt load", async(() => {
        let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
        let mockTeamFactory = target.debugElement.injector.get(TeamFactory);

        let spyGetDataSet = spyOn(mockDataSetFactory, "get").and.callFake((id: string) => {
            return (Number.parseInt(id) % 2)
                ? Promise.resolve(new DataSet({ _id: id, initiative: new Initiative({ name: `Name ${id}`, team_id: `team_${id}` }) }))
                : Promise.reject("Something wen wrong")
        })
        let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new Team({ team_id: id, name: `Team ${id}` }))

        })

        user$.next(new User({ user_id: "some_new_id", datasets: ["1", "2", "3"] }));

        component.datasets$.then(ds => {
            expect(ds.length).toBe(2);
            expect(ds[0]._id).toBe("1");
            expect(ds[0].initiative.name).toBe(`Name 1`);
            expect(ds[0].team.name).toBe(`Team team_1`);
            expect(ds[1]._id).toBe("3");
            expect(ds[1].initiative.name).toBe(`Name 3`);
            expect(ds[1].team.name).toBe(`Team team_3`);
        })

    }));

    it("should send error to error service when data gathering fails", () => {
        let spyError = spyOn(component.errorService, "handleError").and.callFake(() => { return; });
        user$.error("Cant retrieve user");
        expect(spyError).toHaveBeenCalledWith("Cant retrieve user");
    });

    it("should get rid of subscription on destroy", () => {
        let spy = spyOn(component.subscription, "unsubscribe")
        target.destroy();
        expect(spy).toHaveBeenCalled();
    })

});
