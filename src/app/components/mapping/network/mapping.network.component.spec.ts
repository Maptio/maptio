import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { Router, NavigationStart } from "@angular/router";
import { UserFactory } from "./../../../shared/services/user.factory";
import { Observable, Subject } from "rxjs/Rx";
import { NO_ERRORS_SCHEMA } from "@angular/core";
// import { TooltipComponent } from "./../tooltip/tooltip.component";
import { Initiative } from "./../../../shared/model/initiative.data";
import { UIService } from "./../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../shared/services/ui/color.service";
import { D3Service, D3 } from "d3-ng2-service";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { ErrorService } from "../../../shared/services/error/error.service";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2/dist";
import { RouterTestingModule } from "@angular/router/testing";
import { MappingNetworkComponent } from "./mapping.network.component";

describe("mapping.network.component.ts", () => {

    let component: MappingNetworkComponent;
    let target: ComponentFixture<MappingNetworkComponent>;
    let d3: D3;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                D3Service, ColorService, UIService, UserFactory, Angulartics2Mixpanel, Angulartics2,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                },
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService,
                {
                    provide: Router, useClass: class {
                        navigate = jasmine.createSpy("navigate");
                        events = Observable.of(new NavigationStart(0, "/next"))
                    }
                }
            ],
            declarations: [MappingNetworkComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingNetworkComponent);
        component = target.componentInstance;
        d3 = component.d3Service.getD3();

        component.width = 1000;
        component.height = 1000;
        component.margin = 50;
        component.translateX = 100
        component.translateY = 100
        component.scale = 1;
        component.zoom$ = Observable.of(1);
        component.isReset$ = new Subject<boolean>();
        component.fontSize$ = Observable.of(12);
        component.isLocked$ = Observable.of(true);
        component.analytics = jasmine.createSpyObj("analytics", ["eventTrack"]);

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/network/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    /*
<svg viewBox="0 0 1522 1522" width="100%" font-size="16px">
   <g width="1522" height="1522" transform="translate(0,-380.5) scale(1)">
      <g class="links">
         <path class="edge" data-initiatives="1633574407551,3480512571637,7969679047967,5466322612321" data-source="auth0|58dbf3d4319f9f0ebc0029ce" data-target="auth0|59bfb55a8bd5a32e108974dd" stroke-width="16px" id="auth0|58dbf3d4319f9f0ebc0029ce-auth0|59bfb55a8bd5a32e108974dd" marker-end="url(#arrow)" d="M859.5231455980951,939.2644265632366S893.0462948033984,885.5910274488181 809.2330525286931,806.2218762525551"></path>
         <path class="edge" data-initiatives="1633574407551,3480512571637,7969679047967,5466322612321" data-source="auth0|58dab4eec1002318c6257c93" data-target="auth0|59bfb55a8bd5a32e108974dd" stroke-width="16px" id="auth0|58dab4eec1002318c6257c93-auth0|59bfb55a8bd5a32e108974dd" marker-end="url(#arrow)" d="M899.7262277904407,684.5353388726912S834.067732223736,716.7813682614368 809.2330525286931,806.2218762525551"></path>
         <path class="edge" data-initiatives="1533904557442" data-source="auth0|59f08ca6d48efe234f6c565b" data-target="auth0|58dab4eec1002318c6257c93" stroke-width="4px" id="auth0|59f08ca6d48efe234f6c565b-auth0|58dab4eec1002318c6257c93" marker-end="url(#arrow)" d="M934.4563597601519,590.1526747123011S878.1750016900388,585.8858550678585 899.7262277904407,684.5353388726912"></path>
         <path class="edge" data-initiatives="3778119977597" data-source="auth0|59d3223cc04b650413247907" data-target="auth0|58dbf3d4319f9f0ebc0029ce" stroke-width="4px" id="auth0|59d3223cc04b650413247907-auth0|58dbf3d4319f9f0ebc0029ce" marker-end="url(#arrow)" d="M722.0895862245673,967.3349927206693S775.8043634529192,1014.4210782477073 859.5231455980951,939.2644265632366"></path>
         <path class="edge" data-initiatives="3144446072869,7880117960775" data-source="auth0|58dbf3d4319f9f0ebc0029ce" data-target="auth0|58dab4eec1002318c6257c93" stroke-width="8px" id="auth0|58dbf3d4319f9f0ebc0029ce-auth0|58dab4eec1002318c6257c93" marker-end="url(#arrow)" d="M859.5231455980951,939.2644265632366S917.5896107591054,811.832447733211 899.7262277904407,684.5353388726912"></path>
         <path class="edge" data-initiatives="3480512571637,7969679047967" data-source="auth0|59074cdb3614eb59f2bb8b6a" data-target="auth0|59bfb55a8bd5a32e108974dd" stroke-width="8px" id="auth0|59074cdb3614eb59f2bb8b6a-auth0|59bfb55a8bd5a32e108974dd" marker-end="url(#arrow)" d="M660.5477227112989,865.8616821902048S708.3712572557137,794.4618225073009 809.2330525286931,806.2218762525551"></path>
         <path class="edge" data-initiatives="7969679047967" data-source="auth0|59d3223cc04b650413247907" data-target="auth0|59bfb55a8bd5a32e108974dd" stroke-width="4px" id="auth0|59d3223cc04b650413247907-auth0|59bfb55a8bd5a32e108974dd" marker-end="url(#arrow)" d="M722.0895862245673,967.3349927206693S755.7073133849734,889.3542508627893 809.2330525286931,806.2218762525551"></path>
         <path class="edge" data-initiatives="6087148834569" data-source="auth0|59f08cb369bc0e24e90bef1a" data-target="auth0|59f86cbb3cc31f7ef488de7b" stroke-width="4px" id="auth0|59f08cb369bc0e24e90bef1a-auth0|59f86cbb3cc31f7ef488de7b" marker-end="url(#arrow)" d="M451.1456094789929,387.2224712919568S517.455315215238,383.25604004364243 487.5183286148234,442.68677723383286"></path>
         <path class="edge" data-initiatives="9197962164356,7808405762670" data-source="auth0|58dbf3d4319f9f0ebc0029ce" data-target="auth0|59d3223cc04b650413247907" stroke-width="8px" id="auth0|58dbf3d4319f9f0ebc0029ce-auth0|59d3223cc04b650413247907" marker-end="url(#arrow)" d="M859.5231455980951,939.2644265632366S818.5443334775082,1007.9651582636484 722.0895862245673,967.3349927206693"></path>
         <path class="edge" data-initiatives="6623155183178" data-source="auth0|59074cdb3614eb59f2bb8b6a" data-target="auth0|59d3223cc04b650413247907" stroke-width="4px" id="auth0|59074cdb3614eb59f2bb8b6a-auth0|59d3223cc04b650413247907" marker-end="url(#arrow)" d="M660.5477227112989,865.8616821902048S630.8794541548026,945.805113505019 722.0895862245673,967.3349927206693"></path>
         <path class="edge" data-initiatives="8772763977681" data-source="auth0|59bfb55a8bd5a32e108974dd" data-target="auth0|58dab4eec1002318c6257c93" stroke-width="4px" id="auth0|59bfb55a8bd5a32e108974dd-auth0|58dab4eec1002318c6257c93" marker-end="url(#arrow)" d="M809.2330525286931,806.2218762525551S904.6851428320384,741.5750241678387 899.7262277904407,684.5353388726912"></path>
      </g>
      <g class="labels">
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(848.0189819335938,852.74609375)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Karl Parton helps Hermes Conrad with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Creating a company to support purpose-driven leaders in realising their ideas</tspan>
            <tspan class="is-helping" x="0" y="0" dy="2em">Designing and building the Maptio product</tspan>
            <tspan class="is-helping" x="0" y="0" dy="3em">Developing the brand </tspan>
            <tspan class="is-helping" x="0" y="0" dy="4em">Translating user needs to product specifications</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(833.9326171875,749.3421630859375)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Safiyya Babio helps Hermes Conrad with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Creating a company to support purpose-driven leaders in realising their ideas</tspan>
            <tspan class="is-helping" x="0" y="0" dy="2em">Designing and building the Maptio product</tspan>
            <tspan class="is-helping" x="0" y="0" dy="3em">Developing the brand </tspan>
            <tspan class="is-helping" x="0" y="0" dy="4em">Translating user needs to product specifications</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(894.9651489257812,638.449951171875)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">abc maptio helps Safiyya Babio with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Making sure the money is working 1</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(809.041259765625,972.85107421875)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Tom Nixon helps Karl Parton with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Designing and improving user experience</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(899.8287963867188,788.5714111328125)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Karl Parton helps Safiyya Babio with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Developing the technology</tspan>
            <tspan class="is-helping" x="0" y="0" dy="2em">Building the front-end</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(742.6873168945312,810.7874755859375)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Lisa Gill helps Hermes Conrad with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Designing and building the Maptio product</tspan>
            <tspan class="is-helping" x="0" y="0" dy="2em">Developing the brand </tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(771.5499267578125,869.120849609375)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Tom Nixon helps Hermes Conrad with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Developing the brand </tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(494.5026550292969,409.1014099121094)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">def maptio.com helps tuv maptio with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Managing finance and formal company structures</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(781.410400390625,980.1709594726562)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Karl Parton helps Tom Nixon with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Developing the marketing website</tspan>
            <tspan class="is-helping" x="0" y="0" dy="2em">Carrying out user research</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(674.20751953125,942.6189575195312)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Lisa Gill helps Tom Nixon with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Building the Maptio online community</tspan>
         </text>
         <text class="edge" font-size="12.8px" style="display: none;" transform="translate(877.9668579101562,742.10595703125)">
            <tspan x="0" y="0" class="is-helping-title" dy="0em">Hermes Conrad helps Safiyya Babio with</tspan>
            <tspan class="is-helping" x="0" y="0" dy="1em">Testing application</tspan>
         </text>
      </g>
      <g class="nodes">
         <g class="node" transform="translate(809.2330525286931,806.2218762525551)">
            <circle r="25" fill="url(#imageauth0|59bfb55a8bd5a32e108974dd)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">Hermes Conrad</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
         <g class="node" transform="translate(859.5231455980951,939.2644265632366)">
            <circle r="25" fill="url(#imageauth0|58dbf3d4319f9f0ebc0029ce)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">Karl Parton</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
         <g class="node" transform="translate(899.7262277904407,684.5353388726912)">
            <circle r="25" fill="url(#imageauth0|58dab4eec1002318c6257c93)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">Safiyya Babio</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
         <g class="node" transform="translate(934.4563597601519,590.1526747123011)">
            <circle r="25" fill="url(#imageauth0|59f08ca6d48efe234f6c565b)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">abc maptio</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
         <g class="node" transform="translate(722.0895862245673,967.3349927206693)">
            <circle r="25" fill="url(#imageauth0|59d3223cc04b650413247907)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">Tom Nixon</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
         <g class="node" transform="translate(660.5477227112989,865.8616821902048)">
            <circle r="25" fill="url(#imageauth0|59074cdb3614eb59f2bb8b6a)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">Lisa Gill</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
         <g class="node" transform="translate(487.5183286148234,442.68677723383286)">
            <circle r="25" fill="url(#imageauth0|59f86cbb3cc31f7ef488de7b)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">tuv maptio</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
         <g class="node" transform="translate(451.1456094789929,387.2224712919568)">
            <circle r="25" fill="url(#imageauth0|59f08cb369bc0e24e90bef1a)" pointer-events="auto" cursor="default"></circle>
            <text class="name" pointer-events="auto" cursor="pointer" dx="28" dy="12.5">def maptio.com</text>
            <text class="initiatives"></text>
            <circle></circle>
            <text class="name"></text>
            <text class="initiatives"></text>
         </g>
      </g>
      <defs>
         <pattern id="imageauth0|59bfb55a8bd5a32e108974dd" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/dcdd2a4687a36e2fdb5e3a411689a3fe?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fhc.png"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/dcdd2a4687a36e2fdb5e3a411689a3fe?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fhc.png"></image>
         </pattern>
         <pattern id="imageauth0|58dbf3d4319f9f0ebc0029ce" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/057e83694804a85127615d0277109f6d?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fka.png"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/057e83694804a85127615d0277109f6d?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fka.png"></image>
         </pattern>
         <pattern id="imageauth0|58dab4eec1002318c6257c93" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://res.cloudinary.com/hgkbm0qes/image/upload/v1508230677/lhxiyii4ybnw5eu2lchc.jpg"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://res.cloudinary.com/hgkbm0qes/image/upload/v1508230677/lhxiyii4ybnw5eu2lchc.jpg"></image>
         </pattern>
         <pattern id="imageauth0|59f08ca6d48efe234f6c565b" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/64f10b98c0f1b28433cd1358d729b39c?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fam.png"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/64f10b98c0f1b28433cd1358d729b39c?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fam.png"></image>
         </pattern>
         <pattern id="imageauth0|59d3223cc04b650413247907" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/e57e1c4eed1f8e27e8a2c14b7d7e1481?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fhe.png"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/e57e1c4eed1f8e27e8a2c14b7d7e1481?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fhe.png"></image>
         </pattern>
         <pattern id="imageauth0|59074cdb3614eb59f2bb8b6a" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://res.cloudinary.com/hgkbm0qes/image/upload/v1508328172/ftocse7rzjmhfmpqwu9r.jpg"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://res.cloudinary.com/hgkbm0qes/image/upload/v1508328172/ftocse7rzjmhfmpqwu9r.jpg"></image>
         </pattern>
         <pattern id="imageauth0|59f86cbb3cc31f7ef488de7b" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/028c89664c0c0d8bf214634367bfe4a3?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Ftm.png"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/028c89664c0c0d8bf214634367bfe4a3?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Ftm.png"></image>
         </pattern>
         <pattern id="imageauth0|59f08cb369bc0e24e90bef1a" width="100%" height="100%">
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/596836601fa1b26256946a4ce03977f8?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fdm.png"></image>
            <image width="50" height="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://s.gravatar.com/avatar/596836601fa1b26256946a4ce03977f8?s=480&amp;r=pg&amp;d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fdm.png"></image>
         </pattern>
         <path id="pathauth0|58dbf3d4319f9f0ebc0029ce-auth0|59bfb55a8bd5a32e108974dd" d="M859.5231455980951,939.2644265632366S893.0462948033984,885.5910274488181 809.2330525286931,806.2218762525551"></path>
         <path id="pathauth0|58dab4eec1002318c6257c93-auth0|59bfb55a8bd5a32e108974dd" d="M899.7262277904407,684.5353388726912S834.067732223736,716.7813682614368 809.2330525286931,806.2218762525551"></path>
         <path id="pathauth0|59f08ca6d48efe234f6c565b-auth0|58dab4eec1002318c6257c93" d="M934.4563597601519,590.1526747123011S878.1750016900388,585.8858550678585 899.7262277904407,684.5353388726912"></path>
         <path id="pathauth0|59d3223cc04b650413247907-auth0|58dbf3d4319f9f0ebc0029ce" d="M722.0895862245673,967.3349927206693S775.8043634529192,1014.4210782477073 859.5231455980951,939.2644265632366"></path>
         <path id="pathauth0|58dbf3d4319f9f0ebc0029ce-auth0|58dab4eec1002318c6257c93" d="M859.5231455980951,939.2644265632366S917.5896107591054,811.832447733211 899.7262277904407,684.5353388726912"></path>
         <path id="pathauth0|59074cdb3614eb59f2bb8b6a-auth0|59bfb55a8bd5a32e108974dd" d="M660.5477227112989,865.8616821902048S708.3712572557137,794.4618225073009 809.2330525286931,806.2218762525551"></path>
         <path id="pathauth0|59d3223cc04b650413247907-auth0|59bfb55a8bd5a32e108974dd" d="M722.0895862245673,967.3349927206693S755.7073133849734,889.3542508627893 809.2330525286931,806.2218762525551"></path>
         <path id="pathauth0|59f08cb369bc0e24e90bef1a-auth0|59f86cbb3cc31f7ef488de7b" d="M451.1456094789929,387.2224712919568S517.455315215238,383.25604004364243 487.5183286148234,442.68677723383286"></path>
         <path id="pathauth0|58dbf3d4319f9f0ebc0029ce-auth0|59d3223cc04b650413247907" d="M859.5231455980951,939.2644265632366S818.5443334775082,1007.9651582636484 722.0895862245673,967.3349927206693"></path>
         <path id="pathauth0|59074cdb3614eb59f2bb8b6a-auth0|59d3223cc04b650413247907" d="M660.5477227112989,865.8616821902048S630.8794541548026,945.805113505019 722.0895862245673,967.3349927206693"></path>
         <path id="pathauth0|59bfb55a8bd5a32e108974dd-auth0|58dab4eec1002318c6257c93" d="M809.2330525286931,806.2218762525551S904.6851428320384,741.5750241678387 899.7262277904407,684.5353388726912"></path>
      </defs>
   </g>
   <defs>
      <marker id="arrow" viewBox="0 -5 10 10" refX="19" refY="0" markerWidth="25" markerHeight="25" markerUnits="userSpaceOnUse" orient="auto">
         <path d="M0,-5L10,0L0,5" fill="#bbb" style="opacity: 1;"></path>
      </marker>
      <marker id="arrow-fade" viewBox="0 -5 10 10" refX="19" refY="0" markerWidth="25" markerHeight="25" markerUnits="userSpaceOnUse" orient="auto">
         <path d="M0,-5L10,0L0,5" fill="#bbb" style="opacity: 0.1;"></path>
      </marker>
   </defs>
</svg>

    */

    it("should draw SVG with correct size when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })

        let svg = document.getElementsByTagName("svg")
        expect(svg.length).toBe(1);
        expect(svg.item(0).viewBox.baseVal.width).toBe(1522);
        expect(svg.item(0).viewBox.baseVal.height).toBe(1522); // these are harcoded for now
        expect(svg.item(0).getAttribute("width")).toBe("100%");
    });

    it("should draw SVG centered when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })

        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);

        expect(svg.querySelector("g")).toBeDefined();
        expect(svg.querySelector("g").transform.baseVal.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.e).toBe(100);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.f).toBe(100);
    });

    it("should draw SVG with correct number of node when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })

        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll("g.nodes > g.node > circle").length).toBe(6);
    });

    it("should draw SVG with correct text labels  when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })

        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        // console.log(g.querySelectorAll("g.labels > text.edge"))
        expect(g.querySelectorAll("g.labels > text.edge").length).toBe(4);
    });
});
