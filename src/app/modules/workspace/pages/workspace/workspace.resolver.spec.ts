import { TestBed, fakeAsync, inject } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Mixpanel } from "angulartics2";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { IntercomModule } from "ng-intercom";
import { FullstoryModule } from "ng-fullstory";
import { WorkspaceComponentResolver } from "./workspace.resolver";
import { Auth } from "../../../../core/authentication/auth.service";
import { PermissionService } from "../../../../shared/model/permission.data";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { UserService } from "../../../../shared/services/user/user.service";
import { AuthConfiguration } from "../../../../core/authentication/auth.config";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { JwtEncoder } from "../../../../shared/services/encoding/jwt.service";
import { MailingService } from "../../../../shared/services/mailing/mailing.service";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { AuthHttp } from "angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../../core/mocks/authhttp.helper.shared";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Initiative } from "../../../../shared/model/initiative.data";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";
import { ActivatedRouteSnapshot } from "@angular/router";
import { AnalyticsModule } from "../../../../core/analytics.module";

describe("workspace.resolver.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, AnalyticsModule],
            providers: [
                WorkspaceComponentResolver,
                Auth,
                PermissionService,
                TeamFactory,
                DatasetFactory,
                UserService,
                AuthConfiguration,
                UserFactory,
                JwtEncoder,
                MailingService,
                LoaderService, NgProgress,
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
                Angulartics2Mixpanel
            ]
        });
    });

    it("resolves when all datasets and teams load", fakeAsync(inject([WorkspaceComponentResolver, DatasetFactory, TeamFactory, UserFactory], (target: WorkspaceComponentResolver, datasetFactory: DatasetFactory, teamFactory: TeamFactory, userFactory: UserFactory) => {
        let spyGetDataSet = spyOn(datasetFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new DataSet({ datasetId: id, tags: [], initiative: new Initiative({ name: `Name ${id}`, team_id: `team_${id}` }) }))
        })
        let spyGetTeam = spyOn(teamFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new Team({ team_id: id, name: `Team ${id}`, members: [new User({ user_id: "1" }), new User({ user_id: "2" })] }))
        })
        let spyGetUser = spyOn(userFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new User({ user_id: `user_${id}` }))
        })

        let snapshot = new ActivatedRouteSnapshot();
        snapshot.params = { "mapid": "123" };
        target.resolve(snapshot, undefined).subscribe(data => {
            expect(spyGetDataSet).toHaveBeenCalledWith("123")
            expect(spyGetTeam).toHaveBeenCalledWith("team_123")
            expect(spyGetUser).toHaveBeenCalledWith("1", "2");
            expect(data.dataset.datasetId).toBe("123");
            expect(data.team.team_id).toBe("team_123");
            expect(data.members.length).toBe(3);
        })
    })));


});
