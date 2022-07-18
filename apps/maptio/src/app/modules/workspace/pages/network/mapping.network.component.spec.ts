import { of as observableOf, Observable, Subject } from 'rxjs';
import { Team } from './../../../../shared/model/team.data';
import { Helper } from './../../../../shared/model/helper.data';
import { Initiative } from './../../../../shared/model/initiative.data';
import { ErrorService } from './../../../../shared/services/error/error.service';
import { authHttpServiceFactoryTesting } from '../../../../core/mocks/authhttp.helper.shared';
import { DataService } from '../../services/data.service';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { Router, NavigationStart } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MappingNetworkComponent } from './mapping.network.component';

import { DataSet } from '../../../../shared/model/dataset.data';
import { WorkspaceModule } from '../../workspace.module';
import { AnalyticsModule } from '../../../../core/analytics.module';
import { CoreModule } from '../../../../core/core.module';
import { SharedModule } from '../../../../shared/shared.module';
const fixtures = require('./fixtures/data.json');

describe('mapping.network.component.ts', () => {
  let component: MappingNetworkComponent;
  let target: ComponentFixture<MappingNetworkComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AuthHttp,
            useFactory: authHttpServiceFactoryTesting,
            deps: [Http, BaseRequestOptions],
          },
          {
            provide: Http,
            useFactory: (
              mockBackend: MockBackend,
              options: BaseRequestOptions
            ) => {
              return new Http(mockBackend, options);
            },
            deps: [MockBackend, BaseRequestOptions],
          },
          MockBackend,
          BaseRequestOptions,
          ErrorService,
          {
            provide: Router,
            useClass: class {
              navigate = jest.fn();
              events = observableOf(new NavigationStart(0, '/next'));
            },
          },
        ],
        declarations: [],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
          RouterTestingModule,
          WorkspaceModule,
          AnalyticsModule,
          CoreModule,
          SharedModule.forRoot(),
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(MappingNetworkComponent);
    component = target.componentInstance;

    component.height = window.screen.availHeight;
    component.width = window.screen.availWidth;
    component.margin = 50;
    component.translateX = 100;
    component.translateY = 100;
    component.scale = 1;
    component.zoom$ = observableOf(1);
    component.isReset$ = new Subject<boolean>();
    component.selectableTags$ = observableOf([]);
    component.mapColor$ = observableOf('#aaa');
    component.zoomInitiative$ = observableOf(
      new Initiative({ id: 1, accountable: new Helper(), helpers: [] })
    );

    component.analytics = { eventTrack: jest.fn() } as any;

    const data = new Initiative().deserialize(fixtures);
    const team = new Team({
      team_id: 'TEAMID',
      settings: { authority: 'King', helper: 'Minions' },
    });
    const mockDataService = target.debugElement.injector.get(DataService);
    spyOn(mockDataService, 'get').and.returnValue(
      observableOf({
        initiative: data,
        dataset: new DataSet({}),
        members: [],
        team: team,
      })
    );

    target.detectChanges(); // trigger initial data binding
  });

  it('should draw SVG with correct size when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');
    expect(svgs.length).toBe(1); // these are harcoded for now
    expect(svgs.item(0).getAttribute('width')).toBe(`${component.width}`);
    expect(svgs.item(0).getAttribute('height')).toBe(`${component.height}`);
  });

  it('should draw SVG centered when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');
    expect(svgs.length).toBe(1);
    const svg = svgs.item(0);

    expect(svg.querySelector('g')).toBeDefined();
    expect(svg.querySelector('g').getAttribute('transform')).toBe(
      `translate(0, 0) scale(1)`
    );
  });

  xit('should draw SVG with correct number of node when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');
    expect(svgs.length).toBe(1);
    const g = svgs.item(0).querySelector('g');
    expect(g.querySelectorAll('g.nodes > g.node > circle').length).toBe(6);
  });
});
