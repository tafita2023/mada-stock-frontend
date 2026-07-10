import { TestBed } from '@angular/core/testing';

import { Filtre } from './filtre';

describe('Filtre', () => {
  let service: Filtre;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Filtre);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
