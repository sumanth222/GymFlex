import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

// Simple state union for detail screen
type GymDetailState = 'loading' | 'success' | 'empty' | 'error';

@Component({
  selector: 'app-gym-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gym-detail.html',
  styleUrls: ['./gym-detail.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GymDetailComponent implements OnInit {
  gym: any = null;
  state: GymDetailState = 'loading';
  errorMessage = '';

  // Carousel state
  currentImageIndex = 0;
  private touchStartX = 0;
  private touchDeltaX = 0;
  private readonly swipeThreshold = 40; // px

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadGym();
  }

  // ─────────────────────────────────────────
  // DATA LOADING
  // ─────────────────────────────────────────
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

        // Small delay (for skeleton screen effect)
        setTimeout(() => {
            this.gym = {
                id: snapshot.id,
                ...gymData,

                // Safe fallbacks
                images: gymData['images'] ?? [],
                rating: gymData['rating'] ?? 4.5,
                ratingCount: gymData['ratingCount'] ?? 20,
                distanceKm: gymData['distanceKm'] ?? 2.0
            };

            this.currentImageIndex = 0;

            this.ngZone.run(() => {
                this.state = 'success';
            })
        }, 250);

    } catch (err) {
        console.error('Error loading gym:', err);
        this.errorMessage = 'Failed to load gym details.';
        this.state = 'error';
    }
}


  retry(): void {
    this.loadGym();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToCheckout(): void {
    if (!this.gym?.id) return;
    this.router.navigate(['/checkout', this.gym.id]);
  }

  // ─────────────────────────────────────────
  // CAROUSEL HELPERS
  // ─────────────────────────────────────────

  get hasImages(): boolean {
    return !!this.gym?.images && this.gym.images.length > 0;
  }

  get totalImages(): number {
    return this.hasImages ? this.gym.images.length : 0;
  }

  get currentImage(): string {
    if (!this.hasImages) return '';
    return this.gym.images[this.currentImageIndex];
  }

  nextImage(): void {
    if (!this.hasImages) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.totalImages;
  }

  prevImage(): void {
    if (!this.hasImages) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.totalImages) % this.totalImages;
  }

  goToImage(index: number): void {
    if (!this.hasImages) return;
    if (index < 0 || index >= this.totalImages) return;
    this.currentImageIndex = index;
  }

  // ─────────────────────────────────────────
  // TOUCH EVENTS FOR MOBILE SWIPE
  // (hook these in HTML with (touchstart), (touchmove), (touchend))
  // ─────────────────────────────────────────

  onTouchStart(event: TouchEvent): void {
    if (!event.touches || event.touches.length === 0) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchDeltaX = 0;
  }

  onTouchMove(event: TouchEvent): void {
    if (!event.touches || event.touches.length === 0) return;
    this.touchDeltaX = event.touches[0].clientX - this.touchStartX;
  }

  onTouchEnd(): void {
    if (Math.abs(this.touchDeltaX) > this.swipeThreshold) {
      if (this.touchDeltaX < 0) {
        // swiped left → next
        this.nextImage();
      } else {
        // swiped right → prev
        this.prevImage();
      }
    }
    this.touchStartX = 0;
    this.touchDeltaX = 0;
  }
}