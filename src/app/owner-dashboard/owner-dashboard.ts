// Owner Dashboard Component – GymFlex (Mobile-first)
// Loads gyms owned by logged-in owner, today's bookings & earnings

import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, collection, collectionGroup, doc, getDocs, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-dashboard.html',
  styleUrls: ['./owner-dashboard.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OwnerDashboardComponent implements OnInit {
  owner: User | null = null;

  gyms: any[] = [];
  todayBookings: any[] = [];

  totalEarnings = 0;
  pendingCount = 0;

  // Placeholder thumbnail
  placeholderImg = 'https://via.placeholder.com/120x80?text=Gym';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.router.navigate(['/owner/login']);
        return;
      }

      this.owner = user;
      this.loadGyms();
      this.loadTodayBookings();
    });
  }

  // ───────────────────────────────────────────
  // LOAD OWNER GYMS
  // ───────────────────────────────────────────
  async loadGyms(): Promise<void> {
    if (!this.owner) return;

    const gymsRef = collection(this.firestore, 'gyms');
    const q = query(gymsRef, where('ownerId', '==', this.owner.uid));
    const snap = await getDocs(q);

    this.gyms = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    this.pendingCount = this.gyms.filter(g => g.status === 'pending').length;

    // Calculate earnings
    this.totalEarnings = this.gyms.reduce((sum, g) => sum + (g.earnings || 0), 0);
  }

  // ───────────────────────────────────────────
  // LOAD TODAY'S BOOKINGS (from subcollection)
  // ───────────────────────────────────────────
  async loadTodayBookings(): Promise<void> {
    if (!this.owner) return;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Query bookings belonging to all gyms of this owner
    const bookingsRef = collectionGroup(this.firestore, 'bookings');
    const q = query(bookingsRef, where('ownerId', '==', this.owner.uid), where('date', '==', dateStr));

    const snap = await getDocs(q);

    this.todayBookings = snap.docs.map(d => d.data());
  }

  // ───────────────────────────────────────────
  // NAVIGATION
  // ───────────────────────────────────────────
  goToAddGym(): void {
    this.router.navigate(['/owner/add-gym']);
  }

  openGym(id: string): void {
    this.router.navigate(['/owner/gym', id]);
  }

  viewAllBookings(): void {
    this.router.navigate(['/owner/bookings']);
  }
}