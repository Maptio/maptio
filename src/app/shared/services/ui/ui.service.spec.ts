import { UIService } from "./ui.service";
import { TestBed, inject, } from "@angular/core/testing";
import { MarkdownService } from "ngx-markdown";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions, Http } from "@angular/http";
import { DeviceDetectorService } from "ngx-device-detector";
// import { Fixtures } from "./fixtures";

describe("ui.service.ts", function () {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DeviceDetectorService,
                UIService, MarkdownService,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
            ]
        });
    });

    afterEach(function () {
        fixture.cleanup()
    });

    beforeAll(() => {
        fixture.setBase("src/app/shared/services/fixtures");
    });




    describe("getCircularPath", function () {

        it("When parameters are given, builds circular path", inject([UIService], (fixture: UIService) => {
            let radius = 10;
            let centerX = 0;
            let centerY = 0;

            let actual = fixture.getCircularPath(radius, centerX, centerY);

            let target = "m 0, 0 a -10,-10 1 1,1 20,0 a -10,-10 1 1,1 -20,0"

            expect(actual).toBe(target);
        }));

        it("When radius is missing, getCircularPath throws", inject([UIService], (fixture: UIService) => {

            expect(function () {
                fixture.getCircularPath(undefined, 10, 10);
            }).toThrow();
        }));

        it("When centerX is missing, getCircularPath throws", inject([UIService], (fixture: UIService) => {
            expect(function () {
                fixture.getCircularPath(10, undefined, 10);
            }).toThrow();
        }));

        it("When centerY is missing, getCircularPath throws", inject([UIService], (fixture: UIService) => {
            expect(function () {
                fixture.getCircularPath(10, 10, undefined);
            }).toThrow();
        }));

    });


    describe("clean", function () {
        it("When svg element exists, it cleans", inject([UIService], (target: UIService) => {
            fixture.load("withsvg.html");
            document.body.innerHTML = fixture.el.innerHTML;
            target.clean();

            expect(document.getElementsByTagName("svg").length).toBe(1);
            expect(document.getElementsByTagName("svg").item(0).children).toBeUndefined();
        }));

        it("When many svg element exists, it cleans then all", inject([UIService], (target: UIService) => {
            fixture.load("withmanysvg.html");
            document.body.innerHTML = fixture.el.innerHTML;
            target.clean();

            expect(document.getElementsByTagName("svg").length).toBe(3);
            for (let i = 0; i < 3; i++) {
                expect(document.getElementsByTagName("svg").item(i).children).toBeUndefined();
            }
        }));

        it("When svg element does not exist, it fails gracefully", inject([UIService], (target: UIService) => {
            fixture.load("withoutsvg.html");
            document.body.innerHTML = fixture.el.innerHTML;
            target.clean();

            expect(document.getElementsByTagName("svg").length).toBe(0);
        }));

    });

});