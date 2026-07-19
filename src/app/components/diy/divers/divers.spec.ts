import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Divers } from './divers';

describe('Divers', () => {
  let component: Divers;
  let fixture: ComponentFixture<Divers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Divers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Divers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
