import { MailingService } from "./../../../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "./../../../../shared/services/encoding/jwt.service";
import { AuthConfiguration } from "./../../../../shared/services/auth/auth.config";
import { authHttpServiceFactoryTesting } from "../../../../../../src/test/specs/shared/authhttp.helper.shared";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions } from "@angular/http";
import { Http } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { Angulartics2, Angulartics2Mixpanel } from "angulartics2";
import { TeamFactory } from "./../../../../shared/services/team.factory";
import { UserFactory } from "./../../../../shared/services/user.factory";
import { DatasetFactory } from "./../../../../shared/services/dataset.factory";
import { UserService } from "./../../../../shared/services/user/user.service";
import { FileService } from "./../../../../shared/services/file/file.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { Team } from "./../../../../shared/model/team.data";
import { User } from "./../../../../shared/model/user.data";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { TeamImportComponent } from "./import.component";

describe("import.component.ts", () => {

    let component: TeamImportComponent;
    let target: ComponentFixture<TeamImportComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamImportComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule]
        }).overrideComponent(TeamImportComponent, {
            set: {
                providers: [
                    FileService, UserService,
                    DatasetFactory, UserFactory, TeamFactory,
                    Angulartics2Mixpanel, Angulartics2,
                    AuthConfiguration, JwtEncoder, MailingService,
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
                    BaseRequestOptions
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamImportComponent);

        component = target.componentInstance;
        component.team = new Team({
            name: "Team",
            team_id: "1",
            settings: { authority: "Authority", helper: "Helper" },
            members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
        })
        target.detectChanges();
    });

    it("should bind ", () => {
        expect(true).toBe(true)
    });

});
