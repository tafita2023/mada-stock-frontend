import { TestBed } from '@angular/core/testing';

import { Bases } from './bases';

describe('Bases', () => {
  let service: Bases;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bases);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
