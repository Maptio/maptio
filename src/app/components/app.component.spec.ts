import { ResponsiveModule } from "ng2-responsive";
import { DataSet } from "../shared/model/dataset.data";
import { Router } from "@angular/router";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core"
import { AppComponent } from "./app.component";
import { HelpComponent } from "../components/help/help.component"
import {
    RouterTestingModule
} from "@angular/router/testing";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

describe("app.component.ts", () => {

    let component: AppComponent;
    let target: ComponentFixture<AppComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent, HelpComponent],
            imports: [RouterTestingModule, ResponsiveModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(AppComponent, {
            set: {
                providers: [
                    { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AppComponent);

        component = target.componentInstance;
    });


    describe("Controller", () => {
        it("should open Help modal in openHelp", () => {

            let spy = spyOn(component.helpComponent, "open");
            component.openHelp();
            expect(spy).toHaveBeenCalled();
        });

        it("should display /workspace in openDataset", () => {
            let mockRouter = target.debugElement.injector.get(Router);
            component.openDataset(new DataSet({ name: "Example", _id: "some_unique_id" }));
            expect(mockRouter.navigate).toHaveBeenCalledWith(["workspace", "some_unique_id"]);
        });
    });











});
