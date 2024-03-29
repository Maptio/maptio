import { of as observableOf, Observable, Subject, BehaviorSubject } from 'rxjs';
import { ErrorService } from './../../../../shared/services/error/error.service';
import { Initiative } from './../../../../shared/model/initiative.data';
import { authHttpServiceFactoryTesting } from '../../../../core/mocks/authhttp.helper.shared';
import { DataService } from '../../services/data.service';

import { MockBackend } from '@angular/http/testing';
import { Http } from '@angular/http';
import { BaseRequestOptions } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { Router, NavigationStart } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { MappingTreeComponent } from './mapping.tree.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Team } from '../../../../shared/model/team.data';
import { DataSet } from '../../../../shared/model/dataset.data';
import { MapSettingsService } from '../../services/map-settings.service';
import { WorkspaceModule } from '../../workspace.module';
import { AnalyticsModule } from '../../../../core/analytics.module';
import { CoreModule } from '../../../../core/core.module';
import { SharedModule } from '../../../../shared/shared.module';
const fixtures = require('./fixtures/data.json');

describe('mapping.tree.component.ts', () => {
  let component: MappingTreeComponent;
  let target: ComponentFixture<MappingTreeComponent>;
  // let data$: Subject<{ initiative: Initiative, datasetId: string }> = new Subject<{ initiative: Initiative, datasetId: string }>();

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
          AnalyticsModule,
          WorkspaceModule,
          CoreModule,
          SharedModule.forRoot(),
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(MappingTreeComponent);
    component = target.componentInstance;

    component.width = window.screen.availWidth;
    component.height = window.screen.availHeight;
    component.margin = 50;
    component.translateX = 100;
    component.translateY = 100;
    component.scale = 1;
    component.zoom$ = observableOf(1);
    component.isReset$ = new Subject<boolean>();
    component.selectableTags$ = observableOf([]);
    component.mapColor$ = observableOf('#ddd');
    component.zoomInitiative$ = observableOf(new Initiative());
    component.isAllExpanded$ = new BehaviorSubject<boolean>(false);
    component.isAllCollapsed$ = new BehaviorSubject<boolean>(false);

    component.analytics = { eventTrack: jest.fn() } as any;

    const data = new Initiative().deserialize(fixtures);
    const mockDataService = target.debugElement.injector.get(DataService);
    spyOn(mockDataService, 'get').and.returnValue(
      observableOf({
        initiative: data,
        team: new Team({
          settings: { authority: 'Lead', helper: 'Contributor' },
        }),
        dataset: new DataSet({}),
        members: [],
      })
    );

    const mockSettingsService = target.debugElement.injector.get(
      MapSettingsService
    );
    spyOn(mockSettingsService, 'get').and.returnValue({
      views: {
        tree: {
          expandedNodesIds: ['0', '1', '2'],
        },
      },
    });

    target.detectChanges(); // trigger initial data binding
  });

  it('should draw SVG with correct size when data is valid', () => {
    const svg = document.querySelectorAll('svg#map');
    expect(svg.length).toBe(1); // these are harcoded for now
    expect(svg.item(0).getAttribute('width')).toBe('100%');
    expect(svg.item(0).getAttribute('height')).toBe('100%');
  });

  it('should draw SVG with correct transform when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');
    expect(svgs.length).toBe(1);
    const svg = svgs.item(0);

    expect(svg.querySelector('g')).toBeDefined();
    expect(svg.querySelector('g').getAttribute('transform')).toBe(
      `translate(0, 0) scale(1)`
    );
  });

  xit('should draw SVG with correct number of links when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');
    expect(svgs.length).toBe(1);
    const svg = svgs.item(0);
    const paths = svg.querySelectorAll('path.link');
    expect(paths.length).toBe(2);
  });

  xit('should draw SVG with correct number of nodes when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');
    expect(svgs.length).toBe(1);
    const svg = svgs.item(0);
    const nodes = svg.querySelectorAll('g.node');
    expect(nodes.length).toBe(3);
  });

  xit('should draw SVG with correct text labels when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');

    expect(svgs.length).toBe(1);
    const svg = svgs.item(0);
    const nodes = svg.querySelectorAll('g.node');
    expect(nodes.item(0).querySelector('.name').tagName).toBe('foreignObject');
    expect(nodes.item(0).querySelector('.name').innerHTML).toContain(
      'My Company'
    );

    expect(nodes.item(1).querySelector('.name').tagName).toBe('foreignObject');
    expect(nodes.item(1).querySelector('.name').innerHTML).toContain('Tech');

    expect(nodes.item(2).querySelector('.name').tagName).toBe('foreignObject');
    expect(nodes.item(2).querySelector('.name').innerHTML).toContain(
      'Marketing'
    );
  });

  xit('should draw SVG with correct pictures labels when data is valid', () => {
    const svgs = document.querySelectorAll('svg#map');
    expect(svgs.length).toBe(1);
    const svg = svgs.item(0);
    const nodes = svg.querySelectorAll('g.node');
    expect(nodes.item(0).querySelector('circle').style.fill).toBe('url(#i-0)');
    expect(nodes.item(1).querySelector('circle').style.fill).toBe('url(#i-1)');
    expect(nodes.item(2).querySelector('circle').style.fill).toBe('url(#i-2)');

    const patterns = svg.querySelectorAll('defs pattern');
    expect(patterns.item(0).querySelector('image').getAttribute('href')).toBe(
      ''
    );
    expect(patterns.item(1).querySelector('image').getAttribute('href')).toBe(
      'http://cto.image.png'
    );
    expect(patterns.item(2).querySelector('image').getAttribute('href')).toBe(
      'http://cmo.image.png'
    );
  });
});
