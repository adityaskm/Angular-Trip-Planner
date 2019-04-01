import { TestBed } from '@angular/core/testing';

import { TimeCalcService } from './time-calc.service';

describe('TimeCalcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeCalcService = TestBed.get(TimeCalcService);
    expect(service).toBeTruthy();
  });
});
