import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Promotion } from './promotion';

describe('Promotion', () => {
  let component: Promotion;
  let fixture: ComponentFixture<Promotion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Promotion]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Promotion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
