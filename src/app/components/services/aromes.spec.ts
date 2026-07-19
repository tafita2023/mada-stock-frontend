import { TestBed } from '@angular/core/testing';

import { Aromes } from './aromes';

describe('Aromes', () => {
  let service: Aromes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aromes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
