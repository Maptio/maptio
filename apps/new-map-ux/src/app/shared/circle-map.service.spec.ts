import { TestBed } from '@angular/core/testing';

import { CircleMapService } from './circle-map.service';

describe('CircleMapService', () => {
  let service: CircleMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CircleMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
