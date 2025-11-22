// Confirmation Component – GymFlex Daily Pass QR
// Reads navigation state from Checkout and displays QR + details

import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-component.html',
  styleUrls: ['./confirmation-component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmationComponent implements OnInit {
  gym: any = null;
  form: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = history.state;

    // If the user comes to this page directly, nav will be empty
    if (!nav || !nav.gym || !nav.form) {
      this.gym = null;
      this.form = null;
      return;
    }

    // Otherwise we safely load the passed data
    this.gym = nav.gym;
    this.form = nav.form;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}