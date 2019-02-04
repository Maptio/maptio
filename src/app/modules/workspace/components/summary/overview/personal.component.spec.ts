import { PersonalSummaryComponent } from "./personal.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Subject, Observable } from "rxjs";
import { User } from "../../../../../shared/model/user.data";
import { Params } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Module } from "angulartics2";
import { MarkdownModule } from "ngx-markdown";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { DataService } from "../../../../../shared/services/data.service";


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