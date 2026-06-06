import { TestBed } from '@angular/core/testing';

import { Materiel } from './materiel';

describe('Materiel', () => {
  let service: Materiel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Materiel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
