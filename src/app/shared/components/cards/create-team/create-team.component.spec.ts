// import { Observable } from "rxjs/Rx";
// import { Router, NavigationEnd } from "@angular/router";
// import { ComponentFixture, TestBed, async } from "@angular/core/testing";
// import { NO_ERRORS_SCHEMA } from "@angular/core"
// import {
//     RouterTestingModule
// } from "@angular/router/testing";
// import "rxjs/add/operator/map";
// import "rxjs/add/operator/toPromise";
// import { CreateTeamComponent } from "./create-team.component";
// import { UserFactory } from "../../services/user.factory";
// import { TeamFactory } from "../../services/team.factory";
// import { IntercomService } from "./intercom.service";
// import { Angulartics2, Angulartics2Mixpanel } from "angulartics2";
// import { Team } from "../../model/team.data";
// import { User } from "../../model/user.data";
// import { Permissions } from "../../model/permission.data";
// import { SharedModule } from "../../shared.module";
// import { BaseRequestOptions, Http } from "@angular/http";
// import { MockBackend } from "@angular/http/testing";
// import { AuthHttp } from "angular2-jwt";
// import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";

// describe("create-team.component.ts", () => {

//     let component: CreateTeamComponent;
//     let target: ComponentFixture<CreateTeamComponent>;


//     beforeEach(async(() => {

//         TestBed.configureTestingModule({
//             declarations: [CreateTeamComponent],
//             imports: [RouterTestingModule, ResponsiveModule, SharedModule],
//             schemas: [NO_ERRORS_SCHEMA]
//         }).overrideComponent(CreateTeamComponent, {
//             set: {
//                 /*
//                 providers: [
//                     {
//                         provide: Router, useClass: class {
//                             navigate = jasmine.createSpy("navigate");
//                         }
//                     },
//                     {
//                         provide: AuthHttp,
//                         useFactory: authHttpServiceFactoryTesting,
//                         deps: [Http, BaseRequestOptions]
//                     },
//                     {
//                         provide: Http,
//                         useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
//                             return new Http(mockBackend, options);
//                         },
//                         deps: [MockBackend, BaseRequestOptions]
//                     },
//                     MockBackend,
//                     BaseRequestOptions,
//                     UserFactory, TeamFactory, IntercomService, Angulartics2Mixpanel, Angulartics2, 
//                     IntercomService
//                 ]
//                 */
//             }
//         }).compileComponents();
//     }));

//     beforeEach(() => {
//         target = TestBed.createComponent(CreateTeamComponent);
//         component = target.componentInstance;
//         component.isRedirectHome = false;
//         component.existingTeamCount = 0;
//         component.user = new User({});

//         target.detectChanges();
//     });


//     it('should behave...', () => {
//         expect(true).toBe(true)
//     });


//     xdescribe("createNewTeam", () => {
//         it("should do nothing if the form is not valid", async(() => {

//             component.createForm.setValue({
//                 teamName: ""
//             })

//             let mockTeamFactory = target.debugElement.injector.get(TeamFactory);

//             let spyCreate = spyOn(mockTeamFactory, "create")
//             component.createNewTeam();

//             expect(spyCreate).not.toHaveBeenCalled();

//         }));


//         it("should create a new team and add current user to it", async(() => {

//             component.createForm.setValue({
//                 teamName: "New"
//             })
//             component.createForm.markAsDirty();

//             let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
//             let mockUserFactory = target.debugElement.injector.get(UserFactory);
//             let mockRouter = target.debugElement.injector.get(Router)

//             let spyCreate = spyOn(mockTeamFactory, "create").and.returnValue(Promise.resolve(new Team({ team_id: "3", name: "new team" })))
//             let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true));

//             component.user = new User({ user_id: "123", teams: ["1", "2"] });
//             component.createNewTeam();

//             expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({ name: "New", members: [jasmine.objectContaining({ user_id: "123" })] }))

//             spyCreate.calls.mostRecent().returnValue.then((team: Team) => {
//                 expect(team.team_id).toBe("3");
//                 expect(component.user.teams.length).toBe(3);
//                 expect(spyUpsert).toHaveBeenCalledWith(component.user);
//             })

//         }));
//     });









// });
