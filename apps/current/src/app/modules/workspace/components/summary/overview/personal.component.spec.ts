import { PersonalSummaryComponent } from "./personal.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Subject, Observable } from "rxjs";
import { User } from "../../../../../shared/model/user.data";
import { Params } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Initiative } from "../../../../../shared/model/initiative.data";
import { DataService } from "../../../services/data.service";
import { WorkspaceModule } from "../../../workspace.module";
import { AnalyticsModule } from "../../../../../core/analytics.module";
import { CoreModule } from "../../../../../core/core.module";
const fixtures = require("./fixtures/data.json");

describe("personal.component.ts", () => {

    let component: PersonalSummaryComponent;
    let target: ComponentFixture<PersonalSummaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [

            ],
            declarations: [],
            imports: [RouterTestingModule, AnalyticsModule, WorkspaceModule, CoreModule],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {

        target = TestBed.createComponent(PersonalSummaryComponent);
        component = target.componentInstance;

        let mockDataService = target.debugElement.injector.get(DataService);
        jest.spyOn(mockDataService, "get").mockResolvedValue(Observable.of({ initiative: fixtures, datasetId: "ID" }));

        target.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeDefined();
    });

});