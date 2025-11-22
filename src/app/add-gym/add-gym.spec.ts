import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGym } from './add-gym';

describe('AddGym', () => {
  let component: AddGym;
  let fixture: ComponentFixture<AddGym>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGym]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGym);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
