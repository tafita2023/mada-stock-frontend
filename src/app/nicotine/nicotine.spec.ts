import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Nicotine } from './nicotine';

describe('Nicotine', () => {
  let component: Nicotine;
  let fixture: ComponentFixture<Nicotine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nicotine]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Nicotine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
