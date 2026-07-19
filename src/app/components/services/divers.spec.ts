import { TestBed } from '@angular/core/testing';

import { Divers } from './divers';

describe('Divers', () => {
  let service: Divers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Divers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
