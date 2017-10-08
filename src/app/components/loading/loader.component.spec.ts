import { Subject } from "rxjs/Rx";
import { LoaderService, LoaderState } from "./../../shared/services/loading/loader.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { LoaderComponent } from "./loader.component";
import { async, TestBed, ComponentFixture } from "@angular/core/testing";


describe("loader.component.ts", () => {

    let component: LoaderComponent;
    let target: ComponentFixture<LoaderComponent>;
    let state$: Subject<LoaderState> = new Subject<LoaderState>()

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [LoaderComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).overrideComponent(LoaderComponent, {
            set: {
                providers: [
                    {
                        provide: LoaderService,
                        useClass: class {
                            loaderState = state$.asObservable()
                        }
                    }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(LoaderComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    it("should get rid of subscription on destroy", () => {
        let spy = spyOn(component.subscription, "unsubscribe")
        target.destroy();
        expect(spy).toHaveBeenCalled();
    })

    it("should dispaly loader when show is true", () => {
        state$.next({ show: true })
        expect(component.show).toBe(true)
    });

    it("should hide loader when show is false", () => {
        state$.next({ show: false })
        expect(component.show).toBe(false)
    });



});
