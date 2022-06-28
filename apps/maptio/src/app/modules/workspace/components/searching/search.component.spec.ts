import { SearchComponent, SearchResultType } from './search.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { Helper } from '../../../../shared/model/helper.data';
import { Initiative } from '../../../../shared/model/initiative.data';
import { Observable } from 'rxjs';
import { AnalyticsModule } from '../../../../core/analytics.module';

describe('search.component.ts', () => {
  let component: SearchComponent;
  let target: ComponentFixture<SearchComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SearchComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [RouterTestingModule, AnalyticsModule],
      })
        .overrideComponent(SearchComponent, {
          set: {
            // providers: [
            //     Angulartics2Mixpanel
            // ]
          },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(SearchComponent);

    component = target.componentInstance;

    let boss = new Helper({ user_id: 'boss', name: 'Boss' });
    let helper1 = new Helper({ user_id: 'helper1', name: 'Helper1' });
    let helper2 = new Helper({ user_id: 'helper2', name: 'Helper2' });

    component.list = [
      new Initiative({
        id: 1,
        name: 'One',
        description: 'un',
        accountable: boss,
        helpers: [helper1],
      }),
      new Initiative({
        id: 2,
        name: 'Two',
        description: 'deux',
        accountable: boss,
        helpers: [helper2],
      }),
      new Initiative({
        id: 3,
        name: 'Three',
        description: 'trois',
        accountable: boss,
        helpers: [helper1, helper2],
      }),
      new Initiative({
        id: 4,
        name: 'Four',
        description: 'quatre',
        helpers: [helper1],
      }),
      new Initiative({
        id: 4,
        name: 'Four',
        description: 'quatre',
        accountable: boss,
        helpers: [],
      }),
    ];
    target.detectChanges();
  });

  it('shoud format results correctly', () => {
    let actual = component.formatter(component.list[0]);
    expect(actual).toBe('One');
  });

  it('should select initiative', () => {
    spyOn(component.selectInitiative, 'emit');
    component.select({
      item: { type: SearchResultType.Initiative, result: component.list[1] },
      preventDefault: null,
    });
    expect(component.isSearching).toBeFalsy();
    expect(component.selectInitiative.emit).toHaveBeenCalledWith(
      component.list[1]
    );
  });

  describe('Filter', () => {
    it('should return correct results when searching name', () => {
      let term = 'one';
      let actual = component.findInitiatives(term);
      expect(actual.length).toBe(1);
      expect(actual[0].type).toEqual(SearchResultType.Initiative);
      expect(actual[0].result).toEqual(component.list[0]);
    });

    it('should return correct results when searching description', () => {
      let term = 'deux';
      let actual = component.findInitiatives(term);
      expect(actual.length).toBe(1);
      expect(actual[0].type).toEqual(SearchResultType.Initiative);
      expect(actual[0].result).toEqual(component.list[1]);
    });

    it('should return correct results when searching person', () => {
      let term = 'boss';
      let actual = component.findInitiatives(term);
      expect(actual.length).toBe(4);

      expect(actual[0].type).toEqual(SearchResultType.Initiative);
      expect(actual[0].result).toEqual(component.list[0]);
      expect(actual[1].type).toEqual(SearchResultType.Initiative);
      expect(actual[1].result).toEqual(component.list[1]);
      expect(actual[2].type).toEqual(SearchResultType.Initiative);
      expect(actual[2].result).toEqual(component.list[2]);
      expect(actual[3].type).toEqual(SearchResultType.Initiative);
      expect(actual[3].result).toEqual(component.list[4]);
    });

    it('should return correct results when searching person', () => {
      let term = 'helper';
      let actual = component.findInitiatives(term);
      expect(actual.length).toBe(4);
      expect(actual[0].type).toEqual(SearchResultType.Initiative);
      expect(actual[0].result).toEqual(component.list[0]);
      expect(actual[1].type).toEqual(SearchResultType.Initiative);
      expect(actual[1].result).toEqual(component.list[1]);
      expect(actual[2].type).toEqual(SearchResultType.Initiative);
      expect(actual[2].result).toEqual(component.list[2]);
      expect(actual[3].type).toEqual(SearchResultType.Initiative);
      expect(actual[3].result).toEqual(component.list[3]);
    });
  });

  describe('Search', () => {
    it(
      'calls correct dependencies',
      waitForAsync(() => {
        let spyObj = {
          debounceTime: jest.fn().mockReturnThis(),
          distinctUntilChanged: jest.fn().mockReturnThis(),
          do: jest.fn().mockReturnThis(),
          map: jest.fn().mockReturnThis(),
        } as any;

        let spyFilter = spyOn(component, 'findInitiatives').and.returnValue([]);

        component.search(spyObj);

        expect(spyObj.debounceTime).toHaveBeenCalledWith(200);
        expect(spyObj.distinctUntilChanged).toHaveBeenCalledTimes(1);
        expect(spyObj.do).toHaveBeenCalledTimes(2);
      })
    );
  });
});
