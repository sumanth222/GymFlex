// Checkout Component – GymFlex Daily Pass
// Standalone, Zomato/Airbnb style, with form handling

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGym();
  }

  // ─────────────────────────────────────
  // LOAD GYM DATA (mock for now)
  // ─────────────────────────────────────
  loadGym(): void {
    this.state = 'loading';

    try {
      const id = this.route.snapshot.params['id'];

      const data = [
        {
          id: 'gym_iron_flex_01',
          name: 'Iron Flex Fitness Studio',
          address: '4th Cross, HSR Layout, Sector 6, Bangalore',
          price: 199
        },
        {
          id: 'gym_corex_02',
          name: 'CoreX Fitness Club',
          address: '17th Main Road, Koramangala 5th Block, Bangalore',
          price: 149
        }
      ];

      const found = data.find(g => g.id === id);

      if (!found) {
        this.state = 'empty';
        return;
      }

      setTimeout(() => {
        this.gym = found;
        this.state = 'success';
      }, 300);

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
  onSubmit(): void {
    if (!this.form.name || !this.form.phone || !this.form.date) return;

    this.isSubmitting = true;

    // Simulate payment processing
    setTimeout(() => {
      this.isSubmitting = false;

      // In real case, send data to backend + generate QR
      this.router.navigate(['/confirmation'], {
        state: {
          gym: this.gym,
          form: this.form
        }
      });
    }, 1200);
  }
}