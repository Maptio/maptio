import { ComponentFixture, TestBed, async, inject, fakeAsync } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from '@angular/http';
import { DataSetService } from './dataset.service'
import { ErrorService } from './error.service';


describe('dataset.service.ts', () => {

    let spyErrorService: jasmine.Spy;

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

       spyOn(ErrorService.prototype, 'handleError').and.callFake(function () {});

    });

    it('Gets a list of datasets from static configuration', fakeAsync(inject([DataSetService, MockBackend, ErrorService], (dataSetService: DataSetService, mockBackend: MockBackend, mockErrorService: ErrorService) => {

        mockBackend.connections.subscribe((connection: MockConnection) => {
            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify("") // irrelevant here as our array is static
            })));
        });

        dataSetService.getData().then(datasets => {
            expect(datasets.length).toBe(1);
            expect(datasets[0].name).toBe("Vestd");
            expect(mockErrorService.handleError).not.toHaveBeenCalled();
        });
    })));

});



