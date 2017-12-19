
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { Auth } from "../../shared/services/auth/auth.service";
import { TeamFactory } from "../../shared/services/team.factory";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { User } from "../../shared/model/user.data";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { AuthConfiguration } from "../../shared/services/auth/auth.config";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { UserService } from "../../shared/services/user/user.service";
import { MailingService } from "../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";
import { UserFactory } from "../../shared/services/user.factory";
import { ActivatedRouteSnapshot } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { LoaderService } from "../../shared/services/loading/loader.service";
import { Angulartics2Module, Angulartics2, Angulartics2Mixpanel } from "angulartics2";
import { ErrorService } from "../../shared/services/error/error.service";
import { DataSet } from "../../shared/model/dataset.data";
import { Initiative } from "../../shared/model/initiative.data";
import { Team } from "../../shared/model/team.data";
import { WorkspaceComponentResolver } from "./workspace.resolver";

describe("workspace.resolver.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, Angulartics2Module],
            providers: [
                WorkspaceComponentResolver,
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

    it("resolves when all datasets and teams load", fakeAsync(inject([WorkspaceComponentResolver, DatasetFactory, TeamFactory, UserFactory], (target: WorkspaceComponentResolver, datasetFactory: DatasetFactory, teamFactory: TeamFactory, userFactory: UserFactory) => {
        let spyGetDataSet = spyOn(datasetFactory, "get").and.callFake((id: string) => {
            return Promise.resolve(new DataSet({ _id: id, tags: [], initiative: new Initiative({ name: `Name ${id}`, team_id: `team_${id}` }) }))
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
            expect(data.dataset._id).toBe("123");
            expect(data.team.team_id).toBe("team_123");
            expect(data.members.length).toBe(3);
        })
    })));


});
