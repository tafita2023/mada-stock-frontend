import { TestBed } from '@angular/core/testing';
import { Nicotine } from './nicotine';

describe('Nicotine', () => {
  let service: Nicotine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Nicotine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
