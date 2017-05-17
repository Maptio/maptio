import { Observable } from 'rxjs/Rx';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { TeamFactory } from './../../shared/services/team.factory';
import { ActivatedRoute } from '@angular/router';
import { TestBed, inject, async, ComponentFixture } from "@angular/core/testing";

import { TeamComponent } from "./team.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ErrorService } from "../../shared/services/error/error.service";

describe("team.component.ts", () => {
    let component: TeamComponent;
    let target: ComponentFixture<TeamComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeamComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(TeamComponent, {
            set: {
                providers: [TeamFactory,
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
                        provide: ActivatedRoute,
                        useValue: {
                            params: Observable.of({ teamid: 123 })
                        }
                    }]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamComponent);
        component = target.componentInstance;
    });

    it("should have an instance", () => {
        expect(component).toBeDefined();
    });
});