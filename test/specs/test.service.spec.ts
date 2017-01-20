// // App
// class TestService {
//     public name: string = 'Injected Service';
// }


// // App tests
// import { inject, TestBed } from '@angular/core/testing';
// import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// // describe('TestService', () => {

// //     beforeEach(() => {
// //         this.testService = new TestService();
// //     });

// //     it('should have name property set', () => {
// //         expect(this.testService.name).toBe('Injected Service');
// //     });

// // });




// describe('TestService Injected', () => {

//     beforeAll( ()=> {
//         TestBed.resetTestEnvironment();
//         TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
//     });

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             providers: [TestService],
//         });
//     });

    
//     // beforeEach(inject([TestService], (testService: TestService) => {
//     //     console.log(testService.name);
//     //     this.t = testService;
//     // }));

//     it('should have name property set', inject([TestService], (testService: TestService) => {
//         expect(testService.name).toBe('Injected Service');
//     }));

//     it('should get injected', () => {
//         expect(true).toBe(true);
//     });

// });

// // describe('Karma fixtures', () => {

// //     it("doesn't work", () => {
// //         fixture.setBase("base/test/fixtures");

// //         console.log('+++++++', fixture.load('basic.html'))
// //         expect(true).toBe(false);
// //     });
// // });
