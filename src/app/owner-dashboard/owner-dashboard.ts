import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  templateUrl: './owner-dashboard.html',
  styleUrls: ['./owner-dashboard.scss'],
  imports: [CommonModule]
})
export class OwnerDashboardComponent implements OnInit {

  gyms: any[] = [];
  ownerId: string | null = null;
  loading = true;
  totalEarnings = 0;
  totalBookings = 0;
  todayEarnings = 0;


  placeholderImg =
    "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600";

  constructor(
    private firestore: Firestore,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.ownerId = localStorage.getItem("owner_uid");

    if (!this.ownerId) {
      this.router.navigate(['/owner/login']);
      return;
    }

    this.loadGyms();
  }

async loadGyms() {
  this.loading = true;
  this.gyms = [];

  console.log("🔍 ownerId:", this.ownerId);

  try {
    const ref = collection(this.firestore, 'gyms');
    const q = query(ref, where("ownerId", "==", this.ownerId));

    console.log("⏳ Running Firestore query...");

    const snapshot = await getDocs(q);

    console.log("📄 Query complete. Empty?", snapshot.empty);
    console.log("📄 Docs found:", snapshot.size);

    snapshot.forEach(doc => {
      console.log("➡ Gym:", doc.data());
      this.gyms.push({ id: doc.id, ...doc.data() });
    });

  } catch (err) {
    console.error("🔥 Firestore ERROR:", err);
  }finally {
    this.ngZone.run(() => {
      this.loading = false;
    });
  }

  console.log("🎉 Final gyms array:", this.gyms);
  await this.calculateEarnings();
}

async calculateEarnings() {
  const bookingsRef = collection(this.firestore, 'bookings');

  // Fetch all bookings for ALL owner gyms
  const q = query(bookingsRef, where("ownerId", "==", this.ownerId));
  const snapshot = await getDocs(q);

  let today = new Date().toISOString().split("T")[0];

  snapshot.forEach(doc => {
    const data: any = doc.data();

    this.totalBookings++;

    this.totalEarnings += Number(data.amount);

    if (data.date === today) {
      this.todayEarnings += Number(data.amount);
    }
  });
}
  // ---- Button Actions ----

  goAddGym() {
    this.router.navigate(['/owner/add-gym']);
  }

  editGym(id: string) {
    this.router.navigate(['/owner/edit-gym', id]);
  }

  viewGym(id: string) {
    this.router.navigate(['/owner/gym', id]);
  }

  viewBookings(id: string) {
    this.router.navigate(['/owner/gym-bookings', id]);
  }

  scan(gymId: string) {
    this.router.navigate(['/owner/scan', gymId]);
  }

  logout() {
    localStorage.removeItem('owner_uid');
    this.router.navigate(['/owner/login']);
  }
}