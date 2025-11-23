import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
  const nav = history.state;

  if (!nav || !nav.bookingId || !nav.booking || !nav.gym) {
    this.gym = null;
    this.booking = null;
    return;
  }

  this.bookingId = nav.bookingId;
  this.booking = nav.booking;
  this.gym = nav.gym;
}

  goHome() {
    this.router.navigate(['/']);
  }
}