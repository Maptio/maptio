import { D3Service } from "d3-ng2-service";
import { UIService } from "./../../../app/shared/services/ui.service";
import { TestBed, inject, } from "@angular/core/testing";

describe("ui.service.ts", function () {


    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UIService, D3Service
            ]
        });

        spyOn(D3Service.prototype, "getD3").and.callThrough();

    });

    afterEach(function () {
        fixture.cleanup()
    });

    beforeAll(() => {
        fixture.setBase("src/app/shared/services/fixtures");
    });




    describe("getCircularPath", function () {

        it("When parameters are given, builds circular path", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
            let radius = 10;
            let centerX = 0;
            let centerY = 0;

            let actual = fixture.getCircularPath(radius, centerX, centerY);

            let target = "m 0, 0 a -10,-10 1 1,1 20,0 a -10,-10 1 1,1 -20,0"

            expect(actual).toBe(target);
        }));

        it("When radius is missing, getCircularPath throws", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {

            expect(function () {
                fixture.getCircularPath(undefined, 10, 10);
            }).toThrow();
        }));

        it("When centerX is missing, getCircularPath throws", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
            expect(function () {
                fixture.getCircularPath(10, undefined, 10);
            }).toThrow();
        }));

        it("When centerY is missing, getCircularPath throws", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
            expect(function () {
                fixture.getCircularPath(10, 10, undefined);
            }).toThrow();
        }));

    });


    describe("clean", function () {
        it("When svg element exists, it cleans", inject([UIService, D3Service], (target: UIService, d3Service: D3Service) => {
            fixture.load("withsvg.html");
            document.body.innerHTML = fixture.el.innerHTML;
            target.clean();

            expect(d3Service.getD3).toHaveBeenCalled();
            expect(document.getElementsByTagName("svg").length).toBe(1);
            expect(document.getElementsByTagName("svg").item(0).children).toBeUndefined();
        }));

        it("When many svg element exists, it cleans then all", inject([UIService, D3Service], (target: UIService, d3Service: D3Service) => {
            fixture.load("withmanysvg.html");
            document.body.innerHTML = fixture.el.innerHTML;
            target.clean();

            expect(d3Service.getD3).toHaveBeenCalled();
            expect(document.getElementsByTagName("svg").length).toBe(3);
            for (let i = 0; i < 3; i++) {
                expect(document.getElementsByTagName("svg").item(i).children).toBeUndefined();
            }
        }));

        it("When svg element does not exist, it fails gracefully", inject([UIService, D3Service], (target: UIService, d3Service: D3Service) => {
            fixture.load("withoutsvg.html"); // fixture.load("withoutsvg.html");
            document.body.innerHTML = fixture.el.innerHTML;
            target.clean();

            expect(d3Service.getD3).toHaveBeenCalled();
            expect(document.getElementsByTagName("svg").length).toBe(0);
        }));

    });

});