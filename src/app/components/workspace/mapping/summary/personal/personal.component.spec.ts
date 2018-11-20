import { MarkdownModule, MarkdownService } from "angular2-markdown";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { Observable, Subject } from "rxjs/Rx";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { ActivatedRoute, Params } from "@angular/router";
import { MockBackend } from "@angular/http/testing";
import { Angulartics2Mixpanel, Angulartics2, Angulartics2Module } from "angulartics2";
import { RouterTestingModule } from "@angular/router/testing";
import { D3Service } from "d3-ng2-service";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { PersonalSummaryComponent } from "./personal.component";
import { DataService } from "../../../../../shared/services/data.service";
import { User } from "../../../../../shared/model/user.data";
import { Auth } from "../../../../../shared/services/auth/auth.service";
import { UserFactory } from "../../../../../shared/services/user.factory";


describe("personal.component.ts", () => {

    let component: PersonalSummaryComponent;
    let target: ComponentFixture<PersonalSummaryComponent>;
    let user$: Subject<User> = new Subject<User>();
    let routeParams$: Subject<Params> = new Subject<Params>();

    // class MockActivatedRoute {
    //     params: Subject<Params> = new Subject<Params>();
    // }

    // let route: MockActivatedRoute;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                
            ],
            declarations: [PersonalSummaryComponent],
            imports: [RouterTestingModule, Angulartics2Module, MarkdownModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {

        target = TestBed.createComponent(PersonalSummaryComponent);
        component = target.componentInstance;

        let data = new Initiative().deserialize(fixture.load("data.json"));
        let mockDataService = target.debugElement.injector.get(DataService);
        spyOn(mockDataService, "get").and.returnValue(Observable.of({ initiative: data, datasetId: "ID" }));

        target.detectChanges();
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/workspace/mapping/member-summary/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });


});