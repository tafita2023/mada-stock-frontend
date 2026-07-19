import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Aromes } from './aromes';

describe('Aromes', () => {
  let component: Aromes;
  let fixture: ComponentFixture<Aromes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aromes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Aromes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
