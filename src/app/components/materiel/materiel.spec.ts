import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Materiel } from './materiel';

describe('Materiel', () => {
  let component: Materiel;
  let fixture: ComponentFixture<Materiel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Materiel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Materiel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
