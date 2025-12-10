import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-owner-gym-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-gym-bookings.html',
  styleUrls: ['./owner-gym-bookings.scss']
})
export class OwnerGymBookingsComponent implements OnInit {

  gymId = '';
  bookings: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.gymId = this.route.snapshot.params['id'];
    this.loadBookings();
  }

  async loadBookings() {
    this.loading = true;

    try {
      const ref = collection(this.firestore, 'bookings');
      const q = query(ref, where("gymId", "==", this.gymId));

      const snapshot = await getDocs(q);

      this.bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (err) {
      console.error("Failed to load bookings", err);
    }

    this.ngZone.run(() => {
      this.loading = false;
    })
  }

  goBack() {
    this.router.navigate(['/owner']);
  }
}