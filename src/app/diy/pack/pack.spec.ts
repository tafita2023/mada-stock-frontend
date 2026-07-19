import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pack } from './pack';

describe('Pack', () => {
  let component: Pack;
  let fixture: ComponentFixture<Pack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pack]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pack);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
