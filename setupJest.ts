import 'jest-preset-angular';
import './jestGlobalMocks';

// import "ngx-fullstory/"

// jest.genMockFromModule("ngx-fullstory/")
// jest.mock(
//     'ngx-fullstory',
//     () => ({
//         FullstoryModule: {
//             forRoot: jest.fn().mockImplementation((config) => {
//                 return {
//                     ngModule: {
//                         forRoot: jest.fn().mockReturnThis()
//                     },
//                     providers: [
//                         {
//                             provide: {
//                                 fsOrg: "test",
//                                 fsDebug: true,
//                                 fsHost: "test",
//                                 fsNameSpace: "test",
//                             },
//                             useValue: config
//                         },
//                     ]
//                 }
//             }

//             )
//         },
//         FullStory: {
//             login: jest.fn(),
//             logout: jest.fn(),
//             loadFullstory: jest.fn()
//         },
//         FullstoryConfig: {
//             fsOrg: "test",
//             fsDebug: true,
//             fsHost: "test",
//             fsNameSpace: "test",
//         }
//     }
//     ));

