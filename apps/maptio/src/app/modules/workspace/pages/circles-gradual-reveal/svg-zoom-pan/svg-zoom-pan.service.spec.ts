import { TestBed } from '@angular/core/testing';

import { SvgZoomPanService } from './svg-zoom-pan.service';

describe('SvgZoomPanService', () => {
  let service: SvgZoomPanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgZoomPanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
