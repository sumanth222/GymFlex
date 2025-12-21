import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Unsubscribe } from 'firebase/firestore';


@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation-component.html',
  styleUrls: ['./confirmation-component.scss'],
  imports: [CommonModule]
})
export class ConfirmationComponent implements OnInit {

  bookingId: string | null = null;
  booking: any = null;
  gym: any = null;
  paymentState: 'pending' | 'submitted' | 'confirmed' = 'pending';
  private bookingUnsub?: Unsubscribe;


  constructor(private router: Router, private firestore: Firestore) {}

  ngOnInit(): void {
    const nav = history.state;

    this.bookingId = nav?.bookingId;
    this.booking = nav?.booking;
    this.gym = nav?.gym;

    if (!this.bookingId) return;

    this.listenToBooking();
  }

  listenToBooking(): void {
    const id = this.bookingId;

    if(id != null){
      const bookingRef = doc(this.firestore, 'bookings', id);
      this.bookingUnsub = onSnapshot(bookingRef, (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();

        this.booking = data;

        switch (data['status']) {
          case 'PAYMENT_INITIATED':
            this.paymentState = 'pending';
            break;

          case 'PAYMENT_PENDING_CONFIRMATION':
            this.paymentState = 'submitted';
            break;

          case 'PAID_CONFIRMED':
            this.paymentState = 'confirmed';
            break;
        }
      });
    }
  }


  async markAsPaid(): Promise<void> {
      if(this.bookingId != null){
      const bookingRef = doc(this.firestore, 'bookings', this.bookingId);

      await updateDoc(bookingRef, {
        status: 'PAYMENT_PENDING_CONFIRMATION',
        paidAt: Date.now()
      });
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
  if (this.bookingUnsub) {
    this.bookingUnsub();
  }
}
}