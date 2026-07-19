import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bases } from './bases';

describe('Bases', () => {
  let component: Bases;
  let fixture: ComponentFixture<Bases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bases]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bases);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
