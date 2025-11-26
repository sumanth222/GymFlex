// owner-qr-scanner.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, collection, doc, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
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
    private firestore: Firestore,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.gymId = this.route.snapshot.paramMap.get('gymId');
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }

  resetData(){
    this.ngZone.run(() => {
      this.verifyState = 'idle';
      this.verifyMessage = '';
      this.bookingId = '';
    })
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
  try {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }

    const videoElement = this.videoRef?.nativeElement;
    if (videoElement) {
      videoElement.pause();
      videoElement.srcObject = null;
    }

  } catch (err) {
    console.error("Stop scan error:", err);
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

    let bookingExists = false;
    var booking : any;

    try {
      const ref = collection(this.firestore, 'bookings');
      const snapshot = await getDocs(ref);

      snapshot.docs.every((doc) => {
        if(doc.id === id){
          bookingExists = true;
          booking = doc.data();
          return false;
        }
        return true;
      })

    } catch (err) {
      console.error("Error fetching bookings:", err);
      this.ngZone.run(() => {
        this.verifyState = 'error';
        this.verifyMessage = 'Invalid pass. Booking not found.';
      })
      
      return;
    }

    if(!bookingExists){
      this.ngZone.run(() => {
        this.verifyState = 'error';
        this.verifyMessage = 'Invalid pass. Booking not found.';
      })
      return;
    }

    try {
      // Optional: ensure pass is for this gym
      if (this.gymId && booking.gymId !== this.gymId) {
        this.ngZone.run(() => {
          this.verifyState = 'error';
          this.verifyMessage = 'This pass is not for your gym.';
        })
        return;
      }

      // Check date (only valid for today)
      const today = new Date().toISOString().split('T')[0];
      if (booking.date !== today) {
        this.ngZone.run(() => {
          this.verifyState = 'error';
          this.verifyMessage = `Expired/Invalid date. Pass is for ${booking.date}.`;
        })
        
        return;
      }

      // Check status
      if (booking.status === 'used') {
        this.ngZone.run(() => {
          this.verifyState = 'error';
          this.verifyMessage = 'This pass has already been used.';
        })
        
        return;
      }

      this.booking = { id: booking.id, ...booking };
      this.ngZone.run(() => {
          this.verifyState = 'success';
          this.verifyMessage = 'Valid pass. You can allow entry.';
      })

    } catch (err) {
      console.error('Verify error:', err);
      this.ngZone.run(() => {
          this.verifyState = 'error';
          this.verifyMessage = 'Something went wrong while verifying the pass.';
        })
    }
  }

  async markAsUsed(): Promise<void> {
    var bookingRef : any;

    try{

    const ref = doc(this.firestore, `bookings/${this.bookingId}`);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      this.verifyState = 'error';
      this.verifyMessage = 'Invalid pass. Booking not found.';
      return;
    }

    // Now update
    await updateDoc(ref, {
      status: 'used',
      usedAt: Date.now()
    });

    this.resetData();
  }
  catch(err){
      console.error("Error: ", err);
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