import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from '@angular/http';
import { DataService } from './data.service'
import { ErrorService } from './error.service';


describe('Data Service Tests', () => {

    let spyErrorService: jasmine.Spy;

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

         spyErrorService = spyOn(ErrorService.prototype, 'handleError').and.callFake(function () {
        });

    });

    it('When URL exists, loads data asynchronously', inject([DataService, MockBackend, ErrorService], (dataService: DataService, mockBackend: MockBackend, mockErrorService: ErrorService) => {
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

        dataService.loadFromAsync(URL).then(data => {
            expect(data.length).toBe(2);
            expect(data[1].name).toEqual('First');
            expect(data[2].name).toEqual('Second');
            expect(this.spyErrorService.toHaveBeenCalledTimes(0));
        });
        
    }));


    it('When URL does not exists, it handles error', inject([DataService, MockBackend, ErrorService], (dataService: DataService, mockBackend: MockBackend, mockErrorService: ErrorService) => {
        const URL = "http://example.com/idontexist.json";

        mockBackend.connections.subscribe((connection: MockConnection) => {
            connection.mockError(new Error("404"))
        });

        dataService.loadFromAsync(URL).then(data => {
            expect(this.spyErrorService).toHaveBeenCalledTimes(1);
        });
    }));
});



