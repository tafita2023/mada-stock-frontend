import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Arome } from './arome';

describe('Arome', () => {
  let component: Arome;
  let fixture: ComponentFixture<Arome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Arome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Arome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
