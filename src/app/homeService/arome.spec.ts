import { TestBed } from '@angular/core/testing';

import { Arome } from './arome';

describe('Arome', () => {
  let service: Arome;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Arome);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
