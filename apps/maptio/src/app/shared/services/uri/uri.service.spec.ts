import { TestBed, inject } from '@angular/core/testing';
import { URIService } from './uri.service';

describe('uri.service.ts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [URIService],
    });
  });

  describe('parseFragment', () => {
    it('should return correct Map when fragment is precedeed by #', inject(
      [URIService],
      (target: URIService) => {
        const fragment = '#x=abc&y=123&array=col1,col2,col3';
        const actual = target.parseFragment(fragment);
        expect(actual.size).toBe(3);
        expect(actual.get('x')).toBe('abc');
        expect(actual.get('y')).toBe('123');
        expect(actual.get('array')).toBe('col1,col2,col3');
      }
    ));

    it('should return correct Map when fragment is not precedeed by #', inject(
      [URIService],
      (target: URIService) => {
        const fragment = 'x=abc&y=123&array=col1,col2,col3';
        const actual = target.parseFragment(fragment);
        expect(actual.size).toBe(3);
        expect(actual.get('x')).toBe('abc');
        expect(actual.get('y')).toBe('123');
        expect(actual.get('array')).toBe('col1,col2,col3');
      }
    ));

    it('should return empty map when fragment is empty', inject(
      [URIService],
      (target: URIService) => {
        const fragment = '';
        const actual = target.parseFragment(fragment);
        expect(actual.size).toBe(0);
      }
    ));

    it('should return empty map when fragment is null', inject(
      [URIService],
      (target: URIService) => {
        const fragment = null;
        const actual = target.parseFragment(fragment);
        expect(actual.size).toBe(0);
      }
    ));

    it('should return empty map when fragment is undefined', inject(
      [URIService],
      (target: URIService) => {
        const fragment = undefined;
        const actual = target.parseFragment(fragment);
        expect(actual.size).toBe(0);
      }
    ));
  });

  describe('buildFragment', () => {
    it('should return correct fragment', inject(
      [URIService],
      (target: URIService) => {
        const fragmentMap = new Map<string, string>();
        fragmentMap.set('x', 'abc');
        fragmentMap.set('y', '123');
        fragmentMap.set('array', 'col1,col2,col3');
        const actual = target.buildFragment(fragmentMap);
        expect(actual).toBe('x=abc&y=123&array=col1,col2,col3');
      }
    ));
  });

  describe('splitURL', () => {
    it('should return correct split when url doesnt have fragment', inject(
      [URIService],
      (target: URIService) => {
        const url = '/map/xxxxx/123/circles';
        const actual = target.splitUrl(url);
        expect(actual.url).toBe('/map/xxxxx/123/circles');
        expect(actual.fragment).toBe('');
      }
    ));

    it('should return correct split when url has fragment', inject(
      [URIService],
      (target: URIService) => {
        const url = '/map/xxxxx/123/circles#scale=1.5';
        const actual = target.splitUrl(url);
        expect(actual.url).toBe('/map/xxxxx/123/circles');
        expect(actual.fragment).toBe('scale=1.5');
      }
    ));

    it('should return correct split when url has 2 fragments', inject(
      [URIService],
      (target: URIService) => {
        const url = '/map/xxxxx/123/circles#scale=1.5#left=50';
        const actual = target.splitUrl(url);
        expect(actual.url).toBe('/map/xxxxx/123/circles');
        expect(actual.fragment).toBe('scale=1.5#left=50');
      }
    ));
  });
});
