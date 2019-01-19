import { PermissionsDirective } from './../../../shared/directives/permission.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JwtEncoder } from "../../../shared/services/encoding/jwt.service";
import { MailingService } from "../../../shared/services/mailing/mailing.service";
import { UserService } from "../../../shared/services/user/user.service";
import { Angulartics2Mixpanel, Angulartics2, Angulartics2Module } from "angulartics2";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { TeamFactory } from "../../../shared/services/team.factory";
import { UserFactory } from "../../../shared/services/user.factory";
import { TeamListComponent } from "./team-list.component";
import { ErrorService } from "../../../shared/services/error/error.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Subject, Observable } from "rxjs/Rx";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { User } from "../../../shared/model/user.data";
import { Auth } from "../../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { MockBackend } from "@angular/http/testing";
import { Team } from "../../../shared/model/team.data";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthConfiguration } from "../../../shared/services/auth/auth.config";
import { Router, NavigationStart, ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { Intercom, IntercomConfig } from 'ng-intercom';
import { LoaderService } from '../../../shared/services/loading/loader.service';
import { NgProgress, NgProgressModule } from '@ngx-progressbar/core';

describe("team-list.component.ts", () => {

    let component: TeamListComponent;
    let target: ComponentFixture<TeamListComponent>;
    let user$: Subject<User> = new Subject<User>();

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamListComponent, PermissionsDirective],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, Angulartics2Module, NgbModule.forRoot(), NgProgressModule]
        }).overrideComponent(TeamListComponent, {
            set: {
                providers: [
                    LoaderService, NgProgress,
                    {
                        provide: Auth, useClass: class {
                            getUser() { return user$.asObservable() }
                            getPermissions(): any[] { return [] }
                            getUserInfo(id: string) { return Promise.resolve(new User({})); }
                        }
                    },
                    UserFactory, TeamFactory, AuthConfiguration, UserService, MailingService, JwtEncoder,
                    {
                        provide: AuthHttp,
                        useFactory: authHttpServiceFactoryTesting,
                        deps: [Http, BaseRequestOptions]
                    },
                    {
                        provide: Router, useClass: class {
                            // navigate = jasmine.createSpy("navigate");
                            events = Observable.of(new NavigationStart(0, "/next"))
                        }
                    },
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    {
                        provide: ActivatedRoute,
                        useClass: class {
                            data = Observable.of({
                                teams: []
                            })

                            snapshot = {
                                queryParamMap : new Map()
                            } 
                        }
                    },
                    MockBackend,
                    BaseRequestOptions,
                    ErrorService,
                    Angulartics2Mixpanel, Angulartics2,
                    Intercom, IntercomConfig
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamListComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    // afterEach(() => {
    //     user$.next(new User({ user_id: "reset", teams: [] }));
    // })

    it("should gather user data", () => {
        user$.next(new User({ user_id: "some_new_id", teams: ["1", "2", "3"] }));
        expect(component.user.user_id).toBe("some_new_id");
    });

    it("should get rid of subscription on destroy", () => {
        let spyUser = spyOn(component.userSubscription, "unsubscribe")
        let spyRoute = spyOn(component.routeSubscription, "unsubscribe")
        target.destroy();
        expect(spyUser).toHaveBeenCalled();
        expect(spyRoute).toHaveBeenCalled();
    })

    // describe("trackByMemberId", () => {
    //     it("should return user_id", () => {
    //         let user = new User({ user_id: "123" });
    //         expect(component.trackByMemberId(undefined, user)).toBe("123");
    //     });
    // });

    describe("trackByTeamId", () => {
        it("should return team_id", () => {
            let user = new Team({ team_id: "123" });
            expect(component.trackByTeamId(undefined, user)).toBe("123");
        });
    });

  
  


});
