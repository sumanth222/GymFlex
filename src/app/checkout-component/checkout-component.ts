// Checkout Component – GymFlex Daily Pass
// Standalone, Zomato/Airbnb style, with form handling

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { doc, getDoc } from '@angular/fire/firestore';


type CheckoutState = 'loading' | 'success' | 'empty' | 'error';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-component.html',
  styleUrls: ['./checkout-component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CheckoutComponent implements OnInit {
  state: CheckoutState = 'loading';
  gym: any = null;
  errorMessage = '';
  isSubmitting = false;

  // form data
  form = {
    name: '',
    phone: '',
    date: '',
    time: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadGym();
  }

  // ─────────────────────────────────────
  // LOAD GYM DATA
  // ─────────────────────────────────────
  async loadGym(): Promise<void> {
  this.state = 'loading';

  try {
    const id = this.route.snapshot.params['id'];

    const gymRef = doc(this.firestore, 'gyms', id);
    const snapshot = await getDoc(gymRef);

    if (!snapshot.exists()) {
      this.state = 'empty';
      return;
    }

    const gymData = snapshot.data();

    // Delay for skeleton effect
    setTimeout(() => {
      this.gym = {
        id: snapshot.id,
        ...gymData,

        // fallback values (for safety)
        name: gymData['name'] ?? 'Gym',
        address: gymData['address'] ?? '',
        price: gymData['price'] ?? 0
      };


      this.ngZone.run(() => {
          this.state = 'success';
      })
    }, 200);

  } catch (err) {
    console.error(err);
    this.state = 'error';
    this.errorMessage = 'Failed to load checkout details.';
  }
}


  retry(): void {
    this.loadGym();
  }

  goBack(): void {
    this.router.navigate(['/gym', this.gym?.id || '']);
  }

  // ─────────────────────────────────────
  // SUBMIT FORM
  // ─────────────────────────────────────
  async onSubmit(): Promise<void> {
    if (!this.form.name || !this.form.phone || !this.form.date) return;

    this.isSubmitting = true;

    try {
      // Build booking object
      const bookingData = {
        gymId: this.gym.id,
        gymName: this.gym.name,
        amount: this.gym.price,
        userName: this.form.name,
        phone: this.form.phone,
        date: this.form.date, // YYYY-MM-DD
        timestamp: Date.now(),

        // optional fields
        gymAddress: this.gym.address,
        city: this.gym.city,
        status: 'active' // active | expired | used
      };

      // Add to Firestore
      const ref = await addDoc(collection(this.firestore, 'bookings'), bookingData);

      const bookingId = ref.id;

      this.isSubmitting = false;

      // Navigate to confirmation page WITH bookingId
      this.router.navigate(['/confirmation'], {
        state: {
          bookingId,
          booking: bookingData,
          gym: this.gym
        }
      });

    } catch (err) {
      console.error("Booking failed:", err);
      this.isSubmitting = false;
      alert("Booking failed. Please try again.");
    }
  }
}