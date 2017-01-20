import { ComponentFixture, TestBed, inject, } from '@angular/core/testing';
import { D3Service, D3 } from 'd3-ng2-service'
import { UIService } from '../../app/services/ui.service'
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe("ui.service.ts", function () {

    beforeAll(() => {
        TestBed.resetTestEnvironment();
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UIService,
                D3Service
            ]
        });



        //fixture.setBase('/Users/safiyya/Documents/Source/circlemapping/fixtures/services/ui.service')
        //fixture.load('clean.withsvg.html');
        // this.cleaned = '<html><head></head><body><svg></svg></body></html>';
        // this.svg = '<html><head></head><body><svg><div></div></svg></body></html>';

        // var HTML = '<svg class="graph"><div></div><svg>';

        // document.body.insertAdjacentHTML(
        //     'afterbegin',
        //     HTML);

        spyOn(D3Service.prototype, "getD3").and.callThrough();

    });

    it("doesn't work", () => {
        fixture.setBase("test/fixtures");

        console.log('+++++++', fixture.load("basic.html"))
    });

    it("inject doenst work", inject([UIService], (fixture: UIService) => {

        expect(true).toBe(true);
    }));

    afterEach(function () {
        fixture.cleanup()
    });


    // describe("getCircularPath", function () {

    //     it("When parameters are given, builds circular path", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
    //         let radius = 10;
    //         let centerX = 0;
    //         let centerY = 0;

    //         let actual = fixture.getCircularPath(radius, centerX, centerY);

    //         let target = "m 0, 0 a -10,-10 1 1,1 20,0 a -10,-10 1 1,1 -20,0"

    //         expect(actual).toBe(target);
    //     }));

    //     it("When radius is missing, getCircularPath throws", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {

    //         expect(function () {
    //             fixture.getCircularPath(undefined, 10, 10);
    //         }).toThrow();
    //     }));

    //     it("When centerX is missing, getCircularPath throws", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
    //         expect(function () {
    //             fixture.getCircularPath(10, undefined, 10);
    //         }).toThrow();
    //     }));

    //     it("When centerY is missing, getCircularPath throws", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
    //         expect(function () {
    //             fixture.getCircularPath(10, 10, undefined);
    //         }).toThrow();
    //     }));

    // });


    // describe("clean", function () {
    //     //https://iamalivingcontradiction.wordpress.com/2015/11/01/how-to-unit-test-your-d3-applications/


    //     // it("When svg element exists, it cleans", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
    //     //     expect(d3Service.getD3).toHaveBeenCalled();
    //     //     console.log(document.body.innerHTML);
    //     //     console.log(document.getElementById('graph').innerHTML);
    //     //     fixture.clean();
    //     //     console.log(document.getElementById('graph').innerHTML);
    //     //     expect(document.getElementById('graph').innerHTML).toBe('');

    //     // }));

    //     // it("When svg element does not exist, it fails gracefully", inject([UIService, D3Service], (fixture: UIService, d3Service: D3Service) => {
    //     //     expect(d3Service.getD3).toHaveBeenCalled();

    //     // }));

    // });

});