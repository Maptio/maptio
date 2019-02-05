import { TestBed } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { Http, HttpModule, BaseRequestOptions } from "@angular/http";
import { DataService } from "./data.service"
import { ErrorService } from "../../../shared/services/error/error.service";

describe("data.service.ts", () => {

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

        spyOn(ErrorService.prototype, "handleError");

    });


});



