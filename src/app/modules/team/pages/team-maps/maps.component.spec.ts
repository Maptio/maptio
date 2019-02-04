// import { Initiative } from './../../../../shared/model/initiative.data';
// import { DataSet } from './../../../../shared/model/dataset.data';
// import { TeamMapsComponent } from './maps.component';
// import { SharedModule } from "./../../../../shared/shared.module";
// import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
// import { Permissions } from "./../../../../shared/model/permission.data";
// import { Auth } from "./../../../../shared/services/auth/auth.service";
// import { ActivatedRouteSnapshot, ActivatedRoute, UrlSegment, ParamMap, Params, Data, Route } from "@angular/router";
// import { ComponentFixture, async, TestBed } from "@angular/core/testing";
// import { TeamFactory } from "../../../../shared/services/team.factory";
// import { NO_ERRORS_SCHEMA, Type } from "@angular/core";
// import { RouterTestingModule } from "@angular/router/testing";
// import { Team } from "../../../../shared/model/team.data";
// import { AuthHttp } from "angular2-jwt/angular2-jwt";
// import { authHttpServiceFactoryTesting } from "../../../../../test/specs/shared/authhttp.helper.shared";
// import { Http, BaseRequestOptions } from "@angular/http";
// import { MockBackend } from "@angular/http/testing";
// import { User } from "../../../../shared/model/user.data";
// import { Observable } from "rxjs/Observable";

// class MockActivatedRoute implements ActivatedRoute {
//     paramMap: Observable<ParamMap>;
//     queryParamMap: Observable<ParamMap>;
//     snapshot: ActivatedRouteSnapshot;
//     url: Observable<UrlSegment[]>;
//     params: Observable<Params>;
//     queryParams: Observable<Params>;
//     fragment: Observable<string>;
//     data: Observable<Data> = Observable.of({
//         assets: {
//             team: new Team({
//                 team_id: "123",
//                 name: "team",
//                 settings: { authority: "A", helper: "H" },
//                 members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
//             }),
//             datasets: [
//                 new DataSet({ datasetId: "1", initiative: new Initiative({ name: "One" }) }),
//                 new DataSet({ datasetId: "2", initiative: new Initiative({ name: "Two" }) }),
//                 new DataSet({ datasetId: "3", initiative: new Initiative({ name: "Three" }) })],
//         }
//     })
//     outlet: string;
//     component: Type<any> | string;
//     routeConfig: Route;
//     root: ActivatedRoute;
//     parent: ActivatedRoute;
//     firstChild: ActivatedRoute;
//     children: ActivatedRoute[];
//     pathFromRoot: ActivatedRoute[];
//     toString(): string {
//         return "";
//     };
// }

// describe("maps.component.ts", () => {

//     let component: TeamMapsComponent;
//     let target: ComponentFixture<TeamMapsComponent>;

//     beforeEach(async(() => {

//         TestBed.configureTestingModule({
//             declarations: [TeamMapsComponent],
//             schemas: [NO_ERRORS_SCHEMA],
//             imports: [RouterTestingModule, NgbModule.forRoot(), SharedModule]
//         }).overrideComponent(TeamMapsComponent, {
//             set: {
//                 providers: [
//                     {
//                         provide: Auth,
//                         useClass: class {
//                             getPermissions(): Permissions[] {
//                                 return []
//                             }
//                         }
//                     },
//                     TeamFactory,
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
//                     {
//                         provide: ActivatedRoute,
//                         useClass: class {
//                             params = Observable.of({ teamid: 123, slug: "slug" })
//                             parent = new MockActivatedRoute()
//                         }
//                     }
//                     // Angulartics2Mixpanel, Angulartics2
//                 ]
//             }
//         }).compileComponents();
//     }));

//     beforeEach(() => {
//         target = TestBed.createComponent(TeamMapsComponent);

//         component = target.componentInstance;
//         target.detectChanges();
//     });

//     it("should bind ", () => {
//         expect(component.datasets).toBeDefined();
//         expect(component.datasets.length).toBe(3)
//     });

// });
