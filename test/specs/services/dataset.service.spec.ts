import { ComponentFixture, TestBed, async, inject, fakeAsync } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from "@angular/http";
import { DataSetService } from "../../../app/shared/services/dataset.service"
import { ErrorService } from "../../../app/shared/services/error.service";
import { AuthenticatedUser } from "../../../app/shared/model/user.model"

let spyErrorService: jasmine.Spy;


describe("dataset.service.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [

                DataSetService
                ,
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
        });

        spyOn(ErrorService.prototype, "handleError");

    });

    it("Gets a list of datasets from static configuration", fakeAsync(inject([DataSetService, MockBackend, ErrorService], (target: DataSetService, mockBackend: MockBackend, mockErrorService: ErrorService) => {

        mockBackend.connections.subscribe((connection: MockConnection) => {

            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify("") // irrelevant here as our array is static
            })));
        });
        let user = new AuthenticatedUser("me@domain.com");

        target.getData(user).then(datasets => {
            expect(datasets.length).toBe(1);
            expect(datasets[0].name).toBe("Vestd");
            expect(mockErrorService.handleError).not.toHaveBeenCalled();

        });
    })));

});



