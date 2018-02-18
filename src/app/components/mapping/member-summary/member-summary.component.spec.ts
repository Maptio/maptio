import { MarkdownModule, MarkdownService } from "angular2-markdown";
import { UserFactory } from "./../../../shared/services/user.factory";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { DatasetFactory } from "./../../../shared/services/dataset.factory";
import { MemberSummaryComponent } from "./member-summary.component";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { Observable, Subject } from "rxjs/Rx";
import { NO_ERRORS_SCHEMA } from "@angular/core";
// import { TooltipComponent } from "./../tooltip/tooltip.component";
import { Initiative } from "./../../../shared/model/initiative.data";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { User } from "../../../shared/model/user.data";
import { TeamFactory } from "../../../shared/services/team.factory";
import { ActivatedRoute, Params } from "@angular/router";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { MockBackend } from "@angular/http/testing";
import { ErrorService } from "../../../shared/services/error/error.service";
import { DataService } from "../../../shared/services/data.service";
import { Angulartics2Mixpanel, Angulartics2, Angulartics2Module } from "angulartics2";
import { RouterTestingModule } from "@angular/router/testing";
import { UIService } from "../../../shared/services/ui/ui.service";
import { D3Service } from "d3-ng2-service";


describe("member-summary.component.ts", () => {

    let component: MemberSummaryComponent;
    let target: ComponentFixture<MemberSummaryComponent>;
    let user$: Subject<User> = new Subject<User>();
    let routeParams$: Subject<Params> = new Subject<Params>();

    // class MockActivatedRoute {
    //     params: Subject<Params> = new Subject<Params>();
    // }

    // let route: MockActivatedRoute;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Auth, useClass: class {
                        getUser() { return user$.asObservable() }
                        getUserInfo(id: string) { return Promise.resolve(new User({})); }
                    }
                },
                UserFactory, TeamFactory, DatasetFactory, DataService, UIService, D3Service,
                {
                    provide: ActivatedRoute,
                    // useValue: { params: Observable.of({ mapid: "123", usershortid: "abc123" }) }
                    useClass: class {
                        get params() { return routeParams$.asObservable() }
                    }
                },
                // { provide: ActivatedRoute, useClass: MockActivatedRoute },
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
                ErrorService,
                MarkdownService,
                Angulartics2Mixpanel, Angulartics2
            ],
            declarations: [MemberSummaryComponent],
            imports: [RouterTestingModule, Angulartics2Module, MarkdownModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {

        target = TestBed.createComponent(MemberSummaryComponent);
        component = target.componentInstance;

        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.selectableTags$ = Observable.of([]);
        let mockDataService = target.debugElement.injector.get(DataService);
        spyOn(mockDataService, "get").and.returnValue(Observable.of({ initiative: data, datasetId: "ID" }));
        component.analytics = jasmine.createSpyObj("analytics", ["eventTrack"]);

        target.detectChanges();
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/member-summary/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("should gather user data based on URL", async(() => {
        // let initiative = new Initiative().deserialize(fixture.load("data.json"));

        // let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
        let mockUserFactory = target.debugElement.injector.get(UserFactory);
        // let mockDatasetFactory = target.debugElement.injector.get(DatasetFactory);

        let spyGetUser = spyOn(mockUserFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "some_user_id" })))
        // let spyGetDataset = spyOn(mockDatasetFactory, "get").and.returnValue(Promise.resolve(new DataSet({ _id: "123", initiative: initiative })))

        routeParams$.next({ mapid: "123", usershortid: "abc123" });
        target.detectChanges();

        expect(component.memberShortId).toBe("abc123")
        expect(component.datasetId).toBe("ID")
        expect(spyGetUser).toHaveBeenCalledWith("abc123");
        spyGetUser.calls.mostRecent().returnValue.then((user: User) => {
            expect(component.memberUserId).toBe("some_user_id")
        })
            .then(() => {
                expect(component.authorities.length).toBe(1) //  counts the initiatives where John Doe is helper
                expect(component.helps.length).toBe(1)// onyl counts the initiatives where John Doe is helper but not accountable

            })

    }))



    it("should get rid of subscription on destroy", () => {
        let spyRoute = spyOn(component.subscription, "unsubscribe")
        target.destroy();
        expect(spyRoute).toHaveBeenCalled();
    })

});