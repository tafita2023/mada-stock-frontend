import { TestBed } from '@angular/core/testing';

import { Packs } from './packs';

describe('Packs', () => {
  let service: Packs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Packs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
