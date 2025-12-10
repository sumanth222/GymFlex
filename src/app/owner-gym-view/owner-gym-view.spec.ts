import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerGymView } from './owner-gym-view';

describe('OwnerGymView', () => {
  let component: OwnerGymView;
  let fixture: ComponentFixture<OwnerGymView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerGymView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerGymView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
