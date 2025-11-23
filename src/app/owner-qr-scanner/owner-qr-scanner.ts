// owner-qr-scanner.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Result } from '@zxing/library';
import { FormsModule } from '@angular/forms';

type VerifyState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-owner-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-qr-scanner.html',
  styleUrls: ['./owner-qr-scanner.scss'],
})
export class OwnerQrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  private codeReader = new BrowserMultiFormatReader();
  private currentStream: MediaStream | null = null;

  gymId: string | null = null;           // current gym (optional but ideal)
  scanning = false;
  scanError = '';

  verifyState: VerifyState = 'idle';
  verifyMessage = '';
  booking: any = null;
  bookingId: string | null = null;

  // manual fallback
  manualBookingId = '';

  private controls: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.gymId = this.route.snapshot.paramMap.get('gymId');
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }

  async startScanning(): Promise<void> {
    this.scanError = '';
    this.booking = null;
    this.verifyState = 'idle';
    this.verifyMessage = '';
    this.bookingId = null;

    try {
      this.scanning = true;

      const videoElement = this.videoRef.nativeElement;

      // Get camera
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      videoElement.srcObject = this.currentStream;
      videoElement.play();

      // Start decoding
      this.controls = this.codeReader.decodeFromVideoDevice(
      undefined,
      videoElement,
      (result?: Result, _error?: any) => {
        if (result) {
          const text = result.getText();
          this.handleScannedBookingId(text);
        }
      }
    );

    } catch (err: any) {
      console.error('Camera error:', err);
      this.scanError =
        'Unable to access camera. Please allow camera permission or try manual entry.';
      this.scanning = false;
      this.stopScanning();
    }
  }

  stopScanning(): void {
  if (this.controls) {
    this.controls.stop();   // THIS is the correct method
  }

  if (this.currentStream) {
    this.currentStream.getTracks().forEach((t) => t.stop());
    this.currentStream = null;
  }

  this.scanning = false;
}

  async handleScannedBookingId(id: string): Promise<void> {
    this.stopScanning(); // stop as soon as we get a result
    this.bookingId = id;
    await this.verifyBooking(id);
  }

  async verifyBooking(id: string): Promise<void> {
    this.verifyState = 'loading';
    this.verifyMessage = '';
    this.booking = null;

    try {
      const ref = doc(this.firestore, 'bookings', id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        this.verifyState = 'error';
        this.verifyMessage = 'Invalid pass. Booking not found.';
        return;
      }

      const data: any = snap.data();

      // Optional: ensure pass is for this gym
      if (this.gymId && data.gymId !== this.gymId) {
        this.verifyState = 'error';
        this.verifyMessage = 'This pass is not for your gym.';
        return;
      }

      // Check date (only valid for today)
      const today = new Date().toISOString().split('T')[0];
      if (data.date !== today) {
        this.verifyState = 'error';
        this.verifyMessage = `Expired/Invalid date. Pass is for ${data.date}.`;
        return;
      }

      // Check status
      if (data.status === 'used') {
        this.verifyState = 'error';
        this.verifyMessage = 'This pass has already been used.';
        return;
      }

      this.booking = { id: snap.id, ...data };
      this.verifyState = 'success';
      this.verifyMessage = 'Valid pass. You can allow entry.';

    } catch (err) {
      console.error('Verify error:', err);
      this.verifyState = 'error';
      this.verifyMessage = 'Something went wrong while verifying the pass.';
    }
  }

  async markAsUsed(): Promise<void> {
    if (!this.booking || !this.booking.id) return;

    try {
      const ref = doc(this.firestore, 'bookings', this.booking.id);
      await updateDoc(ref, {
        status: 'used',
        usedAt: Date.now(),
      });

      this.verifyMessage = 'Pass marked as used.';
      this.booking.status = 'used';
    } catch (err) {
      console.error('Failed to mark as used:', err);
      this.verifyMessage = 'Failed to update pass status.';
    }
  }

  async submitManual(): Promise<void> {
    const trimmed = this.manualBookingId.trim();
    if (!trimmed) return;

    this.bookingId = trimmed;
    await this.verifyBooking(trimmed);
  }

  goBack(): void {
    this.router.navigate(['/owner/dashboard']);
  }
}