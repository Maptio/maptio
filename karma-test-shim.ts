import 'core-js/es6';
import 'core-js/es7/reflect';
import 'reflect-metadata';
import 'zone.js/dist/zone';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy';
import 'zone.js/dist/jasmine-patch';

Error.stackTraceLimit = Infinity;

var appContext = (<{ context?: Function }>require).context('./test', true, /\.spec\.ts/);

appContext.keys().forEach(appContext);

/*
*   THe following lines should be replace by
*   
    import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
   beforeAll(() => {
         TestBed.resetTestEnvironment();
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    });

    Not sure why it is not working otherwise.
*/

// var testing = require('@angular/core/testing');
// var browser = require('@angular/platform-browser-dynamic/testing');

// testing.TestBed.initTestEnvironment(
//     browser.BrowserDynamicTestingModule,
//     browser.platformBrowserDynamicTesting()
// );
