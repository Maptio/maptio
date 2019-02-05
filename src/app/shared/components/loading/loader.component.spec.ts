import { NO_ERRORS_SCHEMA } from "@angular/core";
import { LoaderComponent } from "./loader.component";
import { async, TestBed, ComponentFixture } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NgProgressModule } from "@ngx-progressbar/core";


describe("loader.component.ts", () => {

    let component: LoaderComponent;
    let target: ComponentFixture<LoaderComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports : [NgProgressModule, RouterTestingModule],
            declarations: [LoaderComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(LoaderComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    it("should create component", () => {
        expect(component).toBeDefined();
    })
});
