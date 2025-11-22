import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGym();
  }

  // ─────────────────────────────────────────
  // DATA LOADING (mock for now)
  // ─────────────────────────────────────────
  loadGym(): void {
    this.state = 'loading';

    try {
      const id = this.route.snapshot.params['id'];

      // MOCK DATA – replace with Firestore later
      const data: any[] = [
        {
          id: 'gym_iron_flex_01',
          name: 'Iron Flex Fitness Studio',
          address: '4th Cross, HSR Layout, Sector 6, Bangalore',
          city: 'Bangalore',
          price: 199,
          openingTime: '5:00 AM',
          closingTime: '10:00 PM',
          distanceKm: 1.3,
          rating: 4.6,
          ratingCount: 128,
          images: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
            'https://images.unsplash.com/photo-1554284126-aa88f22d8b74',
            'https://images.unsplash.com/photo-1517964108019-0d4df7e3d4dc'
          ],
          facilities: ['Strength Area', 'Cardio Zone', 'Locker Room', 'Showers'],
          equipment: ['Bench Press', 'Squat Rack', 'Ellipticals', 'Dumbbells (2–40kg)']
        },
        {
          id: 'gym_corex_02',
          name: 'CoreX Fitness Club',
          address: '17th Main Road, Koramangala 5th Block, Bangalore',
          city: 'Bangalore',
          price: 149,
          openingTime: '6:00 AM',
          closingTime: '11:00 PM',
          distanceKm: 2.1,
          rating: 4.3,
          ratingCount: 86,
          images: [
            'https://images.unsplash.com/photo-1558611848-73f7eb4001a1',
            'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
            'https://images.unsplash.com/photo-1599058917212-d750089bc07c'
          ],
          facilities: ['Strength Area', 'CrossFit Rig', 'Cardio Zone'],
          equipment: ['Rower Machine', 'Deadlift Platform', 'Dumbbells (2–45kg)']
        }
      ];

      const found = data.find(g => g.id === id);

      if (!found) {
        this.state = 'empty';
        return;
      }

      // Simulate small delay for skeleton loading
      setTimeout(() => {
        this.gym = found;
        this.currentImageIndex = 0;
        this.state = 'success';
      }, 300);

    } catch (err) {
      console.error(err);
      this.state = 'error';
      this.errorMessage = 'Failed to load gym details.';
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