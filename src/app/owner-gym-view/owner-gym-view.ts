import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-owner-gym-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-gym-view.html',
  styleUrls: ['./owner-gym-view.scss']
})
export class OwnerGymViewComponent implements OnInit {

  gym: any = null;
  loading = true;
  placeholderImg = 'https://images.unsplash.com/photo-1583454110551-21f2fa2a95f5?auto=format&q=80&w=800';

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const ref = doc(this.firestore, 'gyms', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        this.gym = snap.data();
      }
    } catch (err) {
      console.error("Failed to load gym", err);
    }

    this.ngZone.run(() => {
      this.loading = false;
    })
  }

  goBack() {
    this.router.navigate(['/owner']);
  }
}