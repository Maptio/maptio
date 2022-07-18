import { of as observableOf, Observable } from 'rxjs';
import { authHttpServiceFactoryTesting } from '../../../../core/mocks/authhttp.helper.shared';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions } from '@angular/http';
import { Http } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { FileService } from './../../../../shared/services/file/file.service';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Team } from './../../../../shared/model/team.data';
import { User } from './../../../../shared/model/user.data';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TeamImportComponent } from './import.component';
import {
  ActivatedRouteSnapshot,
  ActivatedRoute,
  UrlSegment,
  ParamMap,
  Params,
  Data,
  Route,
} from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { AnalyticsModule } from '../../../../core/analytics.module';

class MockActivatedRoute implements ActivatedRoute {
  paramMap: Observable<ParamMap>;
  queryParamMap: Observable<ParamMap>;
  snapshot: ActivatedRouteSnapshot;
  url: Observable<UrlSegment[]>;
  params: Observable<Params>;
  queryParams: Observable<Params>;
  fragment: Observable<string>;
  data: Observable<Data> = observableOf({
    assets: {
      team: new Team({
        team_id: '123',
        name: 'team',
        settings: { authority: 'A', helper: 'H' },
        members: [new User({ user_id: '1' }), new User({ user_id: '2' })],
      }),
    },
  });
  outlet: string;
  component: Type<any> | string;
  routeConfig: Route;
  root: ActivatedRoute;
  parent: ActivatedRoute;
  firstChild: ActivatedRoute;
  children: ActivatedRoute[];
  pathFromRoot: ActivatedRoute[];
  toString(): string {
    return '';
  }
}

describe('import.component.ts', () => {
  let component: TeamImportComponent;
  let target: ComponentFixture<TeamImportComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeamImportComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
          RouterTestingModule,
          SharedModule.forRoot(),
          CoreModule,
          AnalyticsModule,
        ],
      })
        .overrideComponent(TeamImportComponent, {
          set: {
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
              {
                provide: ActivatedRoute,
                useClass: class {
                  params = observableOf({ teamid: 123, slug: 'slug' });
                  parent = new MockActivatedRoute();
                },
              },
            ],
          },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(TeamImportComponent);

    component = target.componentInstance;
    target.detectChanges();
  });

  describe('File reset', () => {
    it('should reset properties', () => {
      component.fileReset();
      expect(component.isFileInvalid).toBe(false);
      expect(component.importedSuccessfully).toBe(0);
      expect(component.importedFailed).toBe(0);
      expect(component.isImportFinished).toBe(false);
      expect(component.csvRecords).toEqual([]);
    });
  });

  xdescribe('FileChangeListener', () => {
    it('should flag a non CSV file and reset input', () => {
      spyOn(component, 'fileReset');
      spyOn(
        target.debugElement.injector.get(FileService),
        'isCSVFile'
      ).and.returnValue(false);

      component.fileChangeListener({
        srcElement: { files: ['/disk/folder/file.scv'] },
        target: {
          files: [
            {
              name: '/disk/folder/file.csv',
              lastModified: null,
              size: 1000,
              type: 'csv',
              slice: null,
            },
          ],
        },
      });
      expect(component.fileReset).toHaveBeenCalled();
      expect(
        target.debugElement.injector.get(FileService).isCSVFile
      ).toHaveBeenCalledWith('/disk/folder/file.scv');
      expect(component.isFileFormatInvalid).toBe(true);
      // expect(component.isFileFormatInvalid).toBe(false)
    });

    it('should not flag a .csv file', () => {
      spyOn(component, 'fileReset');
      spyOn(
        target.debugElement.injector.get(FileService),
        'isCSVFile'
      ).and.returnValue(true);

      component.fileChangeListener({
        srcElement: { files: ['/disk/folder/file.scv'] },
        target: {
          files: [
            {
              name: '/disk/folder/file.csv',
              lastModified: null,
              size: 1000,
              type: 'csv',
              slice: null,
            },
          ],
        },
      });
      expect(component.fileReset).not.toHaveBeenCalled();
      expect(
        target.debugElement.injector.get(FileService).isCSVFile
      ).toHaveBeenCalledWith('/disk/folder/file.csv');
      expect(component.isFileFormatInvalid).toBe(false);
      // expect(component.isFileFormatInvalid).toBe(false);
    });
  });

  describe('importUsers', () => {
    it(
      'should call correct dependencies',
      waitForAsync(() => {
        component.csvRecords = [
          ['First name', 'Lastname', 'email', 'permission type'],
          ['one', 'Maptio', 'one@maptio.com', 'admin'],
          ['two', 'Maptio', 'two@maptio.com', 'standard'],
          ['three', 'Maptio', 'three@maptio.com', 'admin'],
        ];
        spyOn(component, 'createUser').and.returnValue(Promise.resolve(true));
        component.importUsers();
        expect(component.createUser).toHaveBeenCalledTimes(3);
      })
    );
  });
});
