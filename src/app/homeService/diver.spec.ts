import { TestBed } from '@angular/core/testing';

import { Diver } from './diver';

describe('Diver', () => {
  let service: Diver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Diver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
