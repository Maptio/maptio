import { TestBed } from '@angular/core/testing';

import { OpenReplayService } from './open-replay.service';

describe('OpenReplayService', () => {
  let service: OpenReplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenReplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
