import { Observable } from "rxjs/Rx";
import { LoaderService } from "./../shared/services/loading/loader.service";
import { Initiative } from "./../shared/model/initiative.data";
import { ResponsiveModule } from "ng2-responsive";
import { DataSet } from "../shared/model/dataset.data";
import { Router, NavigationEnd } from "@angular/router";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core"
import { AppComponent } from "./app.component";
import { HelpComponent } from "../components/help/help.component"
import {
    RouterTestingModule
} from "@angular/router/testing";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { Auth } from "../shared/services/auth/auth.service";

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
                    LoaderService,
                    {
                        provide: Auth, useClass: class {
                            allAuthenticated() { return; }
                        }
                    },
                    {
                        provide: Router, useClass: class {
                            navigate = jasmine.createSpy("navigate");
                            public events = new Observable(observer => {
                                observer.next(new NavigationEnd(0, "/login", "/login"));
                                observer.complete();
                            });

                        }
                    }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AppComponent);

        component = target.componentInstance;
    });

    it("should unsubscribe subscription when component is destroyed", () => {
        let spy = spyOn(component.routerSubscription, "unsubscribe");
        target.destroy();
        expect(spy).toHaveBeenCalled();
    })

    describe("isUrlHome", () => {
        it("should return true when url is /home", () => {
            let url = "/home"
            expect(component.isUrlHome(url)).toBeTruthy()
        })

        it("should return true when url starts with /home", () => {
            let url = "/home?token=TOKEN"
            expect(component.isUrlHome(url)).toBeTruthy()
        })

        it("should return true when url is /", () => {
            let url = "/"
            expect(component.isUrlHome(url)).toBeTruthy()
        })

        it("should return false when url is not home URL", () => {
            let url = "/nothome"
            expect(component.isUrlHome(url)).toBeFalsy()
        })
    })

    describe("isUrlMap", () => {
        it("should return true when url is /map", () => {
            let url = "/map"
            expect(component.isUrlMap(url)).toBeTruthy()
        })

        it("should return true when url starts with /map", () => {
            let url = "/map/MAPID"
            expect(component.isUrlMap(url)).toBeTruthy()
        })

        it("should return false when url is not a map URL", () => {
            let url = "/notmap"
            expect(component.isUrlMap(url)).toBeFalsy()
        })
    })












});
