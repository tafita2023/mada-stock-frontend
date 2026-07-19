import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Diver } from './diver';

describe('Diver', () => {
  let component: Diver;
  let fixture: ComponentFixture<Diver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Diver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Diver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
