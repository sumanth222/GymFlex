import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerGymBookings } from './owner-gym-bookings';

describe('OwnerGymBookings', () => {
  let component: OwnerGymBookings;
  let fixture: ComponentFixture<OwnerGymBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerGymBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerGymBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
