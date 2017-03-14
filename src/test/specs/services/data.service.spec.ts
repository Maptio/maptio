import { ComponentFixture, TestBed, async, inject, fakeAsync } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from '@angular/http';
import { DataService } from '../../../app/shared/services/data.service'
import { ErrorService } from '../../../app/shared/services/error.service';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';


let spyErrorService: jasmine.Spy;


describe('data.service.ts', () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [

                DataService
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

        spyOn(ErrorService.prototype, 'handleError');

    });


    it('When URL exists, loads data asynchronously', fakeAsync(inject([DataService, MockBackend, ErrorService], (target: DataService, mockBackend: MockBackend, mockErrorService: ErrorService) => {

        const URL = "http://example.com/data.json";

        const mockResponse = {
            data: [
                { id: 1, name: 'First' },
                { id: 2, name: 'Second' }
            ]
        };

        mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.url == URL) {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(mockResponse)
                })));
            }
            else {
                throw new Error(connection.request.url + " is not setup.");
            }
        });

        target.fetch(URL).then(response => {
            expect(response.data.length).toBe(2);
            expect(response.data[0]).toEqual({ id: 1, name: 'First' });
            expect(response.data[1]).toEqual({ id: 2, name: 'Second' });
            expect(mockErrorService.handleError).not.toHaveBeenCalled();
        });
    })));

    it('When URL does not exists, it handles error', fakeAsync(inject([DataService, MockBackend, ErrorService], (target: DataService, mockBackend: MockBackend, mockErrorService: ErrorService) => {

        const URL = "http://example.com/idontexist.json";

        mockBackend.connections.subscribe((connection: MockConnection) => {
            connection.mockError(new Error("404"))
        });

        target.fetch(URL).then(data => {
            expect(mockErrorService.handleError).toHaveBeenCalled();
        });
    })));
});



