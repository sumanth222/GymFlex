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

  // Touch handling
  private touchStartX: number | null = null;
  private touchDeltaX = 0;
  private readonly swipeThreshold = 40; // px

  // Image loading indicator + safety timeout
  isImageLoading = false;
  private imageLoadTimeout: any | null = null;
  private imageLoadTimeoutMs = 6000;

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

        // ensure Angular picks up the change
        this.ngZone.run(() => {
          this.state = 'success';
        });
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
  // CAROUSEL HELPERS (with loading spinner)
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

  // central setter that also manages loading state
  setImageByIndex(index: number): void {
    if (!this.hasImages) return;

    const len = this.totalImages;
    index = ((index % len) + len) % len; // normalize to [0, len)

    if (index === this.currentImageIndex) return;

    // show loader immediately
    this.isImageLoading = true;

    // update index (getter currentImage will reflect new src)
    this.currentImageIndex = index;

    // safety: clear previous timeout and set new one
    if (this.imageLoadTimeout) {
      clearTimeout(this.imageLoadTimeout);
    }
    this.imageLoadTimeout = setTimeout(() => {
      this.isImageLoading = false;
      this.imageLoadTimeout = null;
    }, this.imageLoadTimeoutMs);
  }

  // prev/next use the central setter
  prevImageClick(): void {
    this.setImageByIndex(this.currentImageIndex - 1);
  }

  nextImageClick(): void {
    this.setImageByIndex(this.currentImageIndex + 1);
  }

  goToImage(index: number): void {
    this.setImageByIndex(index);
  }

  // These methods are intended to be wired to the <img> load/error events
  onImageLoad(): void {
    this.isImageLoading = false;
    if (this.imageLoadTimeout) {
      clearTimeout(this.imageLoadTimeout);
      this.imageLoadTimeout = null;
    }
  }

  onImageError(): void {
    // hide loader and clear timeout; optionally you can set a fallback image here
    this.isImageLoading = false;
    if (this.imageLoadTimeout) {
      clearTimeout(this.imageLoadTimeout);
      this.imageLoadTimeout = null;
    }
    // optional fallback:
    // if (this.gym?.images?.length) {
    //   this.gym.images[this.currentImageIndex] = '/assets/img/placeholder.png';
    // }
  }

  // ─────────────────────────────────────────
  // TOUCH EVENTS FOR MOBILE SWIPE
  // ─────────────────────────────────────────

  onTouchStart(event: TouchEvent): void {
    if (!event.touches || event.touches.length === 0) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchDeltaX = 0;
  }

  onTouchMove(event: TouchEvent): void {
    if (!event.touches || event.touches.length === 0 || this.touchStartX === null) return;
    this.touchDeltaX = event.touches[0].clientX - this.touchStartX;
  }

  onTouchEnd(): void {
    if (Math.abs(this.touchDeltaX) > this.swipeThreshold) {
      if (this.touchDeltaX < 0) {
        // swiped left → next
        this.setImageByIndex(this.currentImageIndex + 1);
      } else {
        // swiped right → prev
        this.setImageByIndex(this.currentImageIndex - 1);
      }
    }
    this.touchStartX = null;
    this.touchDeltaX = 0;
  }
}