import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Confidential } from './confidential';

describe('Confidential', () => {
  let component: Confidential;
  let fixture: ComponentFixture<Confidential>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Confidential]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Confidential);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
