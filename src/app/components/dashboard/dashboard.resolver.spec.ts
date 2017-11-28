
import { TestBed, inject } from "@angular/core/testing";
import { DashboardComponentResolver } from "./dashboard.resolver";
import { Auth } from "../../shared/services/auth/auth.service";
import { TeamFactory } from "../../shared/services/team.factory";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { User } from "../../shared/model/user.data";
import { Observable } from "rxjs/Rx";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { AuthConfiguration } from "../../shared/services/auth/auth.config";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { UserService } from "../../shared/services/user/user.service";
import { MailingService } from "../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";
import { UserFactory } from "../../shared/services/user.factory";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { LoaderService } from "../../shared/services/loading/loader.service";
import { Angulartics2Module, Angulartics2, Angulartics2Mixpanel } from "angulartics2";
import { ErrorService } from "../../shared/services/error/error.service";
import { DataSet } from "../../shared/model/dataset.data";
import { Initiative } from "../../shared/model/initiative.data";
import { Team } from "../../shared/model/team.data";

describe("dashboard.resolver.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, Angulartics2Module],
            providers: [
                DashboardComponentResolver,
                Auth,
                TeamFactory,
                DatasetFactory,
                UserFactory,
                AuthConfiguration, UserService, MailingService, JwtEncoder, LoaderService,
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
                Angulartics2Mixpanel, Angulartics2,
                ErrorService
            ]
        });
    });

    it("resolves when all datasets and teams load", inject([DashboardComponentResolver, Auth, DatasetFactory, TeamFactory], (target: DashboardComponentResolver, auth: Auth, datasetFactory: DatasetFactory, teamFactory: TeamFactory) => {
        spyOn(auth, "getUser").and.returnValue(Observable.of(new User({ user_id: "some_new_id", datasets: ["1", "2", "3"] })))
        let spyGetDataSet = spyOn(datasetFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new DataSet({ _id: id, initiative: new Initiative({ name: `Name ${id}`, team_id: `team_${id}` }) }))
        })
        let spyGetTeam = spyOn(teamFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new Team({ team_id: id, name: `Team ${id}` }))
        })
        target.resolve(undefined, undefined).subscribe(ds => {
            expect(ds).toBeDefined();
            expect(ds.length).toBe(3);
            ds.forEach((d, index) => {
                expect(d._id).toBe(`${index + 1}`);
                expect(d.initiative.name).toBe(`Name ${index + 1}`);
                expect(d.team.name).toBe(`Team team_${index + 1}`);
            })
        })
    }));

    it("resolves  when one dataset doesnt load", inject([DashboardComponentResolver, Auth, DatasetFactory, TeamFactory], (target: DashboardComponentResolver, auth: Auth, datasetFactory: DatasetFactory, teamFactory: TeamFactory) => {
        spyOn(auth, "getUser").and.returnValue(Observable.of(new User({ user_id: "some_new_id", datasets: ["1", "2", "3"] })))
        let spyGetDataSet = spyOn(datasetFactory, "get").and.callFake((id: string) => {
            return (Number.parseInt(id) % 2)
                ? Promise.resolve(new DataSet({ _id: id, initiative: new Initiative({ name: `Name ${id}`, team_id: `team_${id}` }) }))
                : Promise.reject("Something went wrong")
        })
        let spyGetTeam = spyOn(teamFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new Team({ team_id: id, name: `Team ${id}` }))
        })
        target.resolve(undefined, undefined).subscribe(ds => {
            expect(ds.length).toBe(2);
            expect(ds[0]._id).toBe("1");
            expect(ds[0].initiative.name).toBe(`Name 1`);
            expect(ds[0].team.name).toBe(`Team team_1`);
            expect(ds[0].depth).toBe(0);
            expect(ds[1]._id).toBe("3");
            expect(ds[1].initiative.name).toBe(`Name 3`);
            expect(ds[1].team.name).toBe(`Team team_3`);
            expect(ds[1].depth).toBe(0);
        })
    }))

});
