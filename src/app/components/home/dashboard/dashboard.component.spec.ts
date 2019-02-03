import { PermissionService } from '../../../shared/model/permission.data';
import { Initiative } from "../../../shared/model/initiative.data";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions, Http } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { TeamFactory } from "../../../shared/services/team.factory";
import { DatasetFactory } from "../../../shared/services/dataset.factory";

import { DashboardComponent } from "./dashboard.component";
import { ErrorService } from "../../../shared/services/error/error.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Subject, Observable } from "rxjs/Rx";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { User } from "../../../shared/model/user.data";
import { Auth } from "../../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { DataSet } from "../../../shared/model/dataset.data";
import { ActivatedRoute } from "@angular/router";
// import { DashboardComponentResolver } from "../dashboard.resolver";
import { ExportService } from "../../../shared/services/export/export.service";
import * as filesaver from "file-saver"

describe("dashboard.component.ts", () => {

    let component: DashboardComponent;
    let target: ComponentFixture<DashboardComponent>;
    let user$: Subject<User> = new Subject<User>();
    let datasets$: Subject<DataSet[]> = new Subject<DataSet[]>();

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [DashboardComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(DashboardComponent, {
            set: {
                providers: [
                    DatasetFactory, TeamFactory, ExportService,
                    {
                        provide: ActivatedRoute, useClass: class {
                            get data() { return datasets$.asObservable() };
                        }
                    },
                    PermissionService,
                    { provide: Auth, useClass: class { getUser() { return user$.asObservable() } } },
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
                    ErrorService
                ]
            }
        }).compileComponents();
    }));

    // beforeEach(() => {
    //     target = TestBed.createComponent(DashboardComponent);
    //     component = target.componentInstance;
    //     spyOn(target.debugElement.injector.get(DashboardComponentResolver), "resolve")
    //         .and.returnValue(Observable.of([
    //             new DataSet({ datasetId: "1", initiative: new Initiative({ id: 1 }) }),
    //             new DataSet({ datasetId: "2", initiative: new Initiative({ id: 2 }) })]))

    //     target.detectChanges();
    // });

    // it("should get datasets from resolver", () => {
    //     expect(component.datasets).toBeDefined();
    //     expect(component.datasets.length).toBe(2);
    // });

    // it("should get rid of subscription on destroy", () => {
    //     let spy = spyOn(component.subscription, "unsubscribe")
    //     target.destroy();
    //     expect(spy).toHaveBeenCalled();
    // })

    // describe("export", () => {
    //     it("should call correct dependencies", async(() => {
    //         let dataset = new DataSet({ datasetId: "ID", initiative: new Initiative({ name: "data", id: 123 }) })

    //         let spy = spyOn(target.debugElement.injector.get(ExportService), "getReport").and.returnValue(Observable.of("some exported data"));
    //         let saveAsSpy = spyOn(filesaver, "saveAs");
    //         component.export(dataset);
    //         spy.calls.mostRecent().returnValue.subscribe((exportedData: string) => {
    //             expect(saveAsSpy).toHaveBeenCalledWith(new Blob(["some exported data"], { type: "text/csv" }), "data.csv");
    //         })

    //     }));
    // });


});
