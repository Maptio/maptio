import { TestBed, async, inject } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Module, Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { IntercomModule } from "ng-intercom";
import { TeamComponentResolver } from "./team.resolver";
import { Auth } from "../../../../shared/services/auth/auth.service";
import { PermissionService } from "../../../../shared/model/permission.data";
import { TeamFactory } from "../../../../shared/services/team.factory";
import { DatasetFactory } from "../../../../shared/services/dataset.factory";
import { UserFactory } from "../../../../shared/services/user.factory";
import { AuthConfiguration } from "../../../../shared/services/auth/auth.config";
import { UserService } from "../../../../shared/services/user/user.service";
import { MailingService } from "../../../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "../../../../shared/services/encoding/jwt.service";
import { LoaderService } from "../../../../shared/services/loading/loader.service";
import { AuthHttp } from "angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../../../test/specs/shared/authhttp.helper.shared";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { Fullstory, FullstoryConfig } from "ngx-fullstory";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Initiative } from "../../../../shared/model/initiative.data";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";
import { ActivatedRouteSnapshot } from "@angular/router";

describe("team.resolver.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule,Angulartics2Module, NgProgressModule,  IntercomModule.forRoot({
                appId: "",
                updateOnRouterChange: true
            })],
            providers: [
                TeamComponentResolver,
                Auth,
                PermissionService,
                TeamFactory,
                DatasetFactory,
                UserFactory,
                AuthConfiguration, UserService, MailingService, JwtEncoder, LoaderService,NgProgress,
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
                Fullstory, FullstoryConfig
                // ErrorService
            ]
        });
    });

    it("resolves when all datasets and teams load", async(inject([TeamComponentResolver, DatasetFactory, TeamFactory], (target: TeamComponentResolver, datasetFactory: DatasetFactory, teamFactory: TeamFactory) => {
        let spyGetDataSet = spyOn(datasetFactory, "get").and.callFake(() => {
            return Promise.resolve([
                new DataSet({ datasetId: "1", tags: [], initiative: new Initiative({ name: `One`, team_id: `team_id` }) }),
                new DataSet({ datasetId: "2", tags: [], initiative: new Initiative({ name: `Two`, team_id: `team_id` }) }),
                new DataSet({ datasetId: "3", tags: [], initiative: new Initiative({ name: `Three`, team_id: `team_id` }) })
            ])
        })

        let spyGetTeam = spyOn(teamFactory, "get").and.callFake(() => {
            return Promise.resolve(new Team({ team_id: "team_id", name: `Team`, members: [new User({ user_id: "1" }), new User({ user_id: "2" })] }))
        })

        let snapshot = new ActivatedRouteSnapshot();
        snapshot.params = { "teamid": "123" };
        target.resolve(snapshot, undefined).subscribe(data => {
            expect(spyGetDataSet).toHaveBeenCalledWith(jasmine.objectContaining({team_id : "123"}))
            expect(spyGetTeam).toHaveBeenCalledWith("123")

            expect(data.team.team_id).toBe("team_id");
            expect(data.team.name).toBe("Team");
            expect(data.team.members.length).toBe(2);

            expect(data.datasets.length).toBe(3);
            expect(data.datasets[0].initiative.name).toBe("One");
            expect(data.datasets[1].initiative.name).toBe("Three");
            expect(data.datasets[2].initiative.name).toBe("Two");
        })
    })));


});
