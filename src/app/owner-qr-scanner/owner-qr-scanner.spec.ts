import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerQrScannerComponent } from './owner-qr-scanner';

describe('OwnerQrScanner', () => {
  let component: OwnerQrScannerComponent;
  let fixture: ComponentFixture<OwnerQrScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerQrScannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerQrScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
